const https = require('https');

const SENDER_NUMBER = '+19077385558'; // Brad's number used as Sender as per instruction implies, or we need to check if this is the TO number. 
// Wait, "to brad 9077385558" implies Destination.
// "KEY... use this" implies API Key.
// Let's reset the script to be dynamic or just hardcode this specific request. 

const DESTINATION_NUMBER = '+19077385558'; // Brad
const API_KEY = 'KEY019BCFC51AB1A3C1F9823D29996EB793_j66EUQqNmw7FacKMHcP4ar';


if (!TELNYX_API_KEY) {
    console.error("Error: TELNYX_API_KEY environment variable is not set.");
    process.exit(1);
}

const MESSAGES = [
    {
        name: "Seven (77.x)",
        text: "Seven, 77.x is your inheritance - a digital identity for the next generation. Claim here: https://y3kmarkets.com/claim/77-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1"
    },
    {
        name: "Donald (don.x)",
        text: "Donald, welcome to true digital sovereignty. don.x is yours forever. Claim here: https://y3kmarkets.com/claim/don-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0"
    }
];

function sendSMS(message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            from: SENDER_NUMBER,
            to: DESTINATION_NUMBER,
            text: message.text
        });

        const options = {
            hostname: 'api.telnyx.com',
            path: '/v2/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TELNYX_API_KEY}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`[SUCCESS] Sent to ${message.name}: ${body}`);
                    resolve(JSON.parse(body));
                } else {
                    console.error(`[ERROR] Failed to send to ${message.name}: ${body}`);
                    reject(new Error(body));
                }
            });
        });

        req.on('error', (error) => {
            console.error(`[NETWORK ERROR] ${error.message}`);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

(async () => {
    console.log(`Sending ${MESSAGES.length} invitations to ${DESTINATION_NUMBER}...`);
    
    for (const msg of MESSAGES) {
        try {
            await sendSMS(msg);
            // Add slight delay to prevent rate limiting or ordering issues
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error("Stopping due to error.");
        }
    }
})();
