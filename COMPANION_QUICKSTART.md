# 📱 Mobile Companion Quickstart

Your "Steering Wheel" for the Sovereign OS.

## 1. Start the Engine
On your PC:
```powershell
kevan-os run
```
*You should see: `📱 Mobile Companion running at http://0.0.0.0:3000`*

## 2. Open the Tunnel (Secure Link)
In a new terminal:
```powershell
cloudflared tunnel --url http://localhost:3000
```
*Wait for the line saying: `+ https://<random-name>.trycloudflare.com`*

## 3. Burner Phone Setup (iOS/Android)
1. Copy the `.trycloudflare.com` URL.
2. Send it to yourself (Signal / Telegram).
3. Open in Safari (iOS) or Chrome (Android).
4. **iOS:** Tap "Share" (Box with arrow) -> "Add to Home Screen".
5. **Android:** Tap Menu -> "Add to Home Screen".

## 4. Result
You now have a black icon on your home screen called "brad.x".
Open it. It looks and feels like a native app.
- **Status:** Shows if your PC is running.
- **Approvals:** Shows pending transactions (Blank for now).
- **Emergency:** Lockdown button (Simulation for now).

## V1 Security Note
This connection is public via the random URL.
**Do not share the URL.**
V2 will add a pairing PIN. 
Since this is currently Read-Only (mainly), risk is low for simple status checks.
