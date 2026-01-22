const fs = require('fs');
const path = require('path');

const INVITES_DIR = path.join(__dirname, 'INVITATIONS');
if (!fs.existsSync(INVITES_DIR)) fs.mkdirSync(INVITES_DIR);

const RECIPIENTS = [
    {
        name: "Bradley",
        namespace: "brad.x",
        token: "brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9",
        message: "As a key advisor, you're part of an exclusive genesis launch. Your namespace represents permanent digital sovereignty."
    },
    {
        name: "Donald",
        namespace: "don.x",
        token: "don-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0",
        message: "Welcome to true digital sovereignty. don.x is yours forever - an identity that transcends platforms, governments, and corporations."
    },
    {
        name: "Seven",
        namespace: "77.x",
        token: "77-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1",
        message: "77.x is your inheritance - a digital identity for the next generation. Built on cryptographic principles, this namespace will grow with you."
    },
    {
        name: "Special Guest",
        namespace: "88.x",
        token: "88-2026-01-18-d1i6g2e5f7g012d9if5h6e8f7i0d1g2",
        message: "Welcome, Sovereign User. You've been selected to claim a sovereign namespace. 88.x represents fortune and infinite possibility."
    },
    {
        name: "Special Guest",
        namespace: "222.x",
        token: "222-2026-01-18-e2j7h3f6g8h123e0jg6i7f9g8j1e2h3",
        message: "Welcome to true digital sovereignty. 222.x is yours. Balance, harmony, and future-proof identity."
    },
    {
        name: "Special Guest",
        namespace: "333.x",
        token: "333-2026-01-18-f3k8i4g7h9i234f1kh7j8g0h9k2f3i4",
        message: "Welcome, Sovereign User. 333.x is your gateway to the decentralized web. A number of power and creativity."
    }
];

const TEMPLATE = (r) => `
<!DOCTYPE html>
<html>
<head>
    <title>Invitation: ${r.namespace}</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #e0e0e0; padding: 40px; max-width: 600px; margin: 0 auto; }
        .card { border: 1px solid #333; padding: 40px; border-radius: 8px; background: #111; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        h1 { color: #fff; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .token { background: #222; padding: 15px; word-break: break-all; font-weight: bold; color: #00ff9d; border: 1px dashed #444; margin: 20px 0; }
        .btn { display: inline-block; background: #00ff9d; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 20px; }
        .btn:hover { background: #00cc7d; }
        .meta { color: #888; font-size: 0.9em; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Sovereign Grant: ${r.namespace}</h1>
        <p><strong>To:</strong> ${r.name}</p>
        <p>${r.message}</p>
        
        <h3>Your Claim Token</h3>
        <div class="token">${r.token}</div>
        
        <p>This token grants you full cryptographic ownership of the <strong>${r.namespace}</strong> root namespace and its 5 sovereign pillars.</p>
        
        <a href="https://y3kmarkets.com/claim/${r.token}" class="btn">CLAIM SOVEREIGNTY NOW</a>
        
        <div class="meta">
            <p>Protocol: Sovereign Namespace Protocol (SNP)</p>
            <p>Date: ${new Date().toISOString().split('T')[0]}</p>
            <p>Status: RESERVED / WAITING FOR CLAIM</p>
        </div>
    </div>
</body>
</html>
`;

RECIPIENTS.forEach(r => {
    const filename = `${r.namespace.replace('.x', '')}-invitation.html`;
    fs.writeFileSync(path.join(INVITES_DIR, filename), TEMPLATE(r));
    console.log(`Generated: ${filename}`);
});
