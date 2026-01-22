const https = require('https');

// Configuration provided by user
const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const DESTINATION_NUMBER = '+19077385558'; // Brad

// We first need to find a valid SENDER number for THIS new API key.
// The previous sender number belonged to the OLD key.

// Trying one of the numbers with 'xxxiii-voice' connection
const KNOWN_GOOD_SENDER = '+18886115384'; 

function getActiveNumber() {
    return Promise.resolve(KNOWN_GOOD_SENDER);
}

function sendSMS(sender, message) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            from: sender,
            to: DESTINATION_NUMBER,
            text: message
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
                    console.log(`[SUCCESS] Sent: ${body}`);
                    resolve(JSON.parse(body));
                } else {
                    console.error(`[ERROR] Failed: ${body}`);
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
    try {
        console.log("Finding active number for new API key...");
        const sender = await getActiveNumber();
        console.log(`Using sender: ${sender}`);

        const message = "Bradley, you've been granted brad.x - your sovereign Web3 identity. Claim here: https://y3kmarkets.com/claim/brad-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9";
        
        console.log(`Sending invite to Brad (${DESTINATION_NUMBER})...`);
        await sendSMS(sender, message);
        
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
