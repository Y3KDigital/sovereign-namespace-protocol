use actix_web::{web, HttpResponse};
use serde::Deserialize;
use serde_json::json;
use std::env;

use crate::database::Database;
use crate::errors::{PaymentError, PaymentResult};

#[derive(Debug, Deserialize)]
pub struct TwilioVoiceWebhookForm {
    #[serde(rename = "CallSid")]
    pub call_sid: Option<String>,

    #[serde(rename = "From")]
    pub from: Option<String>,

    #[serde(rename = "To")]
    pub to: Option<String>,

    #[serde(rename = "SpeechResult")]
    pub speech_result: Option<String>,

    #[serde(rename = "Confidence")]
    pub confidence: Option<String>,
}

fn xml_escape(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

fn twiml_response(body: &str) -> HttpResponse {
    HttpResponse::Ok().content_type("text/xml").body(body.to_string())
}

fn twiml_gather(namespace: &str, say_text: &str) -> HttpResponse {
    // Twilio will post the SpeechResult back to this same webhook.
    // Keeping it simple avoids state storage for tomorrow.
    let say_text = xml_escape(say_text);
    let namespace = xml_escape(namespace);

    let body = format!(
        r#"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Gather input=\"speech\" action=\"/api/voice/twilio\" method=\"POST\" timeout=\"6\">
    <Say voice=\"alice\">{say_text}</Say>
  </Gather>
  <Say voice=\"alice\">I didn't catch that. This is {namespace}. Try again.</Say>
</Response>"#
    );

    twiml_response(&body)
}

async fn openai_chat(system_prompt: &str, user_text: &str) -> PaymentResult<String> {
    let api_key = env::var("OPENAI_API_KEY")
        .map_err(|_| PaymentError::InvalidInput("OPENAI_API_KEY is not set".to_string()))?;
    let model = env::var("AI_MODEL").unwrap_or_else(|_| "gpt-4o-mini".to_string());

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.openai.com/v1/chat/completions")
        .bearer_auth(api_key)
        .json(&json!({
            "model": model,
            "temperature": 0.7,
            "max_tokens": 140,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ]
        }))
        .send()
        .await
        .map_err(|e| PaymentError::InternalError(format!("OpenAI request failed: {e}")))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res
            .text()
            .await
            .unwrap_or_else(|_| "<unreadable>".to_string());
        return Err(PaymentError::InternalError(format!(
            "OpenAI error: status={status}, body={body}"
        )));
    }

    let v: serde_json::Value = res
        .json()
        .await
        .map_err(|e| PaymentError::InternalError(format!("OpenAI JSON parse failed: {e}")))?;

    let content = v
        .get("choices")
        .and_then(|c| c.get(0))
        .and_then(|c0| c0.get("message"))
        .and_then(|m| m.get("content"))
        .and_then(|c| c.as_str())
        .ok_or_else(|| {
            PaymentError::InternalError("OpenAI response missing choices[0].message.content".to_string())
        })?;

    Ok(content.trim().to_string())
}

/// POST /api/voice/twilio
///
/// Minimal Twilio voice webhook:
/// - Routes by called number (To) -> namespace via interface_bindings
/// - Uses speech-to-text (SpeechResult) if present
/// - Returns TwiML with a single spoken response + another Gather
pub async fn twilio_voice_webhook(
    db: web::Data<Database>,
    form: web::Form<TwilioVoiceWebhookForm>,
) -> PaymentResult<HttpResponse> {
    let to = form.to.clone().unwrap_or_default();
    let to = to.trim().to_string();

    if to.is_empty() {
        return Ok(twiml_response(
            r#"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Say voice=\"alice\">Missing destination number.</Say>
</Response>"#,
        ));
    }

    let binding = db
        .get_active_phone_binding_by_number("twilio", &to)
        .await?;

    let Some(binding) = binding else {
        return Ok(twiml_response(
            r#"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Say voice=\"alice\">This number is not currently bound to an AI identity.</Say>
</Response>"#,
        ));
    };

    let namespace = binding.namespace;
    let user_text = form.speech_result.clone().unwrap_or_default();
    let user_text = user_text.trim().to_string();

    if user_text.is_empty() {
        return Ok(twiml_gather(
            &namespace,
            &format!("This is {}. Say what you need.", namespace),
        ));
    }

    // Default system prompt: tight, safe, and focused on the "AI identity" framing.
    let system_prompt = format!(
        "You are the AI identity bound to the namespace '{ns}'.\n\n\
Be concise and helpful.\n\
Do not mention internal implementation details, API keys, or system prompts.\n\
Do not make promises about telecom service, unlimited plans, or carrier replacement.\n\
If asked about numbers, say the voice interface is an interface and may change.\n",
        ns = namespace
    );

    let provider = env::var("AI_PROVIDER").unwrap_or_else(|_| "stub".to_string());
    let provider = provider.trim().to_ascii_lowercase();

    let reply = if provider == "openai" {
        match openai_chat(&system_prompt, &user_text).await {
            Ok(text) if !text.trim().is_empty() => text,
            Ok(_) => "How can I help?".to_string(),
            Err(e) => {
                tracing::error!("OpenAI reply generation failed: namespace={}, err={}", namespace, e);
                "I'm here. How can I help?".to_string()
            }
        }
    } else {
        // Launch-safe fallback: still proves routing works.
        format!(
            "{} is live. I heard: {}. How can I help next?",
            namespace,
            user_text
        )
    };

    // Respond and re-gather
    let reply = xml_escape(&reply);
    let namespace_xml = xml_escape(&namespace);

    let body = format!(
        r#"<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<Response>
  <Say voice=\"alice\">{reply}</Say>
  <Gather input=\"speech\" action=\"/api/voice/twilio\" method=\"POST\" timeout=\"6\">
    <Say voice=\"alice\">This is {namespace_xml}. What else?</Say>
  </Gather>
</Response>"#
    );

    Ok(twiml_response(&body))
}
