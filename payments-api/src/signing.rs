use base64::engine::general_purpose;
use base64::Engine as _;
use ed25519_dalek::{Signature, SigningKey, VerifyingKey, Signer};

use crate::errors::{PaymentError, PaymentResult};

fn parse_b64(input: &str) -> PaymentResult<Vec<u8>> {
    general_purpose::STANDARD
        .decode(input.trim())
        .map_err(|_| PaymentError::ValidationError("invalid base64 signing key".to_string()))
}

/// Load an Ed25519 signing key from a base64-encoded 32-byte seed.
///
/// Env format: 32-byte seed, base64 (NOT the PEM).
pub fn load_ed25519_signing_key_from_env(var: &str) -> PaymentResult<Option<SigningKey>> {
    let raw = match std::env::var(var) {
        Ok(v) => v,
        Err(_) => return Ok(None),
    };

    let raw = raw.trim();
    if raw.is_empty() {
        return Ok(None);
    }

    let bytes = parse_b64(raw)?;
    if bytes.len() != 32 {
        return Err(PaymentError::ValidationError(format!(
            "{var} must be base64 for a 32-byte Ed25519 seed"
        )));
    }

    let mut seed = [0u8; 32];
    seed.copy_from_slice(&bytes);

    Ok(Some(SigningKey::from_bytes(&seed)))
}

pub fn ed25519_public_key_b64(key: &SigningKey) -> String {
    let vk: VerifyingKey = key.verifying_key();
    general_purpose::STANDARD.encode(vk.as_bytes())
}

pub fn ed25519_sign_b64(key: &SigningKey, payload: &[u8]) -> String {
    let sig: Signature = key.sign(payload);
    general_purpose::STANDARD.encode(sig.to_bytes())
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::engine::general_purpose;
    use ed25519_dalek::{Signature, Verifier};

    #[test]
    fn signs_and_verifies_payload() {
        // 32 bytes of 0x01 as a deterministic seed.
        let seed = vec![1u8; 32];
        let seed_b64 = general_purpose::STANDARD.encode(&seed);
        std::env::set_var("TEST_SIGNING_KEY", &seed_b64);

        let key = load_ed25519_signing_key_from_env("TEST_SIGNING_KEY")
            .unwrap()
            .expect("key");

        let payload = b"hello alaska";
        let sig_b64 = ed25519_sign_b64(&key, payload);
        let sig_bytes = general_purpose::STANDARD.decode(sig_b64).unwrap();
        let sig = Signature::from_slice(&sig_bytes).unwrap();

        let vk = key.verifying_key();
        vk.verify(payload, &sig).unwrap();
    }
}
