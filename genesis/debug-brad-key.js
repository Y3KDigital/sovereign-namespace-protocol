const https = require('https');

const API_KEY = 'KEY019BCFC51AB1A3C1F9823D29996EB793_j66EUQqNmw7FacKMHcP4ar';

const options = {
    hostname: 'api.telnyx.com',
    path: '/v2/phone_numbers',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const data = JSON.parse(body);
            console.log("---- Available Numbers for this Key ----");
            data.data.forEach(n => {
                console.log(`Number: ${n.phone_number} | Status: ${n.status} | Connection: ${n.connection_name}`);
            });
            console.log("----------------------------------------");
        } else {
            console.error("Failed to list numbers:", body);
        }
    });
});

req.on('error', (e) => console.error(e));
req.end();
