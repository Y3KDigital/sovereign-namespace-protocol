const https = require('https');

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;

if (!TELNYX_API_KEY) {
    console.error("Error: TELNYX_API_KEY not set");
    process.exit(1);
}

const options = {
    hostname: 'api.telnyx.com',
    path: '/v2/phone_numbers',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const data = JSON.parse(body);
            console.log("Found Numbers:");
            data.data.forEach(n => {
                console.log(`- ${n.phone_number} (Status: ${n.status})`);
            });
        } else {
            console.error("Failed to list numbers:", body);
        }
    });
});

req.on('error', (e) => console.error(e));
req.end();
