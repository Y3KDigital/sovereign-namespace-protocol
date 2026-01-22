const fs = require('fs');
const path = require('path');

// Target Dir: Sovereign Subnamespaces (The truth)
const OUT_DIR = path.join(__dirname, 'SOVEREIGN_SUBNAMESPACES');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const NEW_ALLOCATIONS = ['88', '222', '333'];

console.log("Generating Ceremonial Artifacts for:", NEW_ALLOCATIONS);

NEW_ALLOCATIONS.forEach(name => {
    // 1. Root Certificate
    const rootCert = {
        version: "1.0.0",
        namespace: `${name}.x`,
        type: "CEREMONIAL_ALLOCATION",
        genesis_hash: "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
        sovereignty: "Ceremonial",
        status: "RESERVED",
        created_at: new Date().toISOString()
    };
    fs.writeFileSync(path.join(OUT_DIR, `${name}.x.json`), JSON.stringify(rootCert, null, 2));

    // 2. Sub-namespaces (Standard Suite)
    const subs = ['auth', 'vault', 'tel', 'finance', 'registry'];
    subs.forEach(sub => {
        const subCert = {
             version: "1.0.0",
             namespace: `${name}.${sub}.x`,
             parent: `${name}.x`,
             type: "CEREMONIAL_SUBNAMESPACE",
             genesis_hash: "0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc",
             created_at: new Date().toISOString()
        };
        fs.writeFileSync(path.join(OUT_DIR, `${name}.${sub}.x.json`), JSON.stringify(subCert, null, 2));
    });

    console.log(`Created suite for: ${name}.x`);
});
