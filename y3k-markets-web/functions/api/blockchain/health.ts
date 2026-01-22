/**
 * Blockchain Registry API - Health Check
 */

export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: "healthy",
    service: "blockchain-registry-api",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
