use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use std::sync::{Arc, Mutex};

// Shared state
struct AppState {
    identity: String,
    status: String,
}

#[get("/")]
async fn index(data: web::Data<Arc<Mutex<AppState>>>) -> impl Responder {
    let state = data.lock().unwrap();
    let html = format!(r#"
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <title>{} Companion</title>
        <style>
            :root {{
                --bg: #000000;
                --card-bg: #111111;
                --text: #ffffff;
                --text-secondary: #888888;
                --accent: #333333;
                --danger: #ff3b30;
                --success: #34c759;
            }}
            body {{ 
                background-color: var(--bg); 
                color: var(--text); 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                padding: 24px; 
                margin: 0;
            }}
            .header {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                padding-top: 20px;
            }}
            h1 {{ 
                font-size: 24px; 
                margin: 0; 
                font-weight: 700;
                letter-spacing: -0.5px;
            }}
            .status-indicator {{
                padding: 4px 12px;
                background: rgba(52, 199, 89, 0.2);
                color: var(--success);
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }}
            .card {{ 
                background: var(--card-bg); 
                border-radius: 16px; 
                padding: 20px; 
                margin-bottom: 24px; 
            }}
            .card h3 {{
                margin: 0 0 16px 0;
                font-size: 14px;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .stat-row {{ 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 12px; 
                font-size: 16px;
            }}
            .stat-row:last-child {{ margin-bottom: 0; }}
            .stat-label {{ color: var(--text-secondary); }}
            .stat-val {{ font-weight: 500; font-family: "SF Mono", "Monaco", monospace; }}
            
            .btn {{ 
                display: block; 
                width: 100%; 
                padding: 16px; 
                background: var(--accent); 
                color: white; 
                border: none; 
                border-radius: 12px; 
                font-size: 16px; 
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }}
            .btn:active {{ opacity: 0.7; }}
            .btn-danger {{ background: rgba(255, 59, 48, 0.2); color: var(--danger); border: 1px solid var(--danger); }}
            
            .empty-state {{
                color: var(--text-secondary);
                text-align: center;
                padding: 20px 0;
                font-style: italic;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{}</h1>
            <span class="status-indicator">CONNECTED</span>
        </div>
        
        <div class="card">
            <h3>System Status</h3>
            <div class="stat-row"><span class="stat-label">Identity</span> <span class="stat-val">{}</span></div>
            <div class="stat-row"><span class="stat-label">Health</span> <span class="stat-val">{}</span></div>
            <div class="stat-row"><span class="stat-label">Uptime</span> <span class="stat-val">100%</span></div>
        </div>

        <div class="card">
            <h3>Approval Queue</h3>
            <div class="empty-state">All caught up. No pending actions.</div>
        </div>

        <div class="card">
            <h3>Emergency Override</h3>
            <button class="btn btn-danger" onclick="confirm('INITIATE LOCKDOWN? This will sever all connections.') && alert('Lockdown Initiated')">LOCKDOWN SYSTEM</button>
        </div>
    </body>
    </html>
    "#, state.identity, state.identity, state.identity, state.status);

    HttpResponse::Ok().content_type("text/html").body(html)
}

#[get("/api/status")]
async fn api_status(data: web::Data<Arc<Mutex<AppState>>>) -> impl Responder {
    let state = data.lock().unwrap();
    HttpResponse::Ok().json(serde_json::json!({
        "identity": state.identity,
        "status": state.status,
        "mode": "operational"
    }))
}

pub async fn start_server(identity: String, port: u16) -> std::io::Result<()> {
    let state = Arc::new(Mutex::new(AppState {
        identity: identity.clone(),
        status: "Operational".to_string(),
    }));

    println!("📱 Mobile Companion running at http://0.0.0.0:{}", port);

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .service(index)
            .service(api_status)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
