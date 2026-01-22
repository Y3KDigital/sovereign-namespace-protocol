const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const invitations = [
  {
    name: 'Invitation 88',
    namespace: '88.x',
    token: '88-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9',
    output: '88-qr.png'
  },
  {
    name: 'Invitation 222',
    namespace: '222.x',
    token: '222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0',
    output: '222-qr.png'
  },
  {
    name: 'Invitation 333',
    namespace: '333.x',
    token: '333-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1',
    output: '333-qr.png'
  }
];

const outputDir = path.join(__dirname, '../genesis/invitations');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateQRCodes() {
  for (const invite of invitations) {
    const url = `https://claim.y3kmarkets.com?token=${invite.token}`;
    const outputPath = path.join(outputDir, invite.output);
    
    try {
      await QRCode.toFile(outputPath, url, {
        errorCorrectionLevel: 'H',
        type: 'png',
        quality: 1,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#f59e0b'
        },
        width: 512
      });
      
      console.log(`✓ Generated QR code for ${invite.name} (${invite.namespace})`);
      console.log(`  Saved to: ${outputPath}`);
      console.log(`  URL: ${url}\n`);
    } catch (error) {
      console.error(`✗ Failed to generate QR code for ${invite.name}:`, error);
    }
  }
  
  console.log('All QR codes generated successfully!');
}

generateQRCodes();
