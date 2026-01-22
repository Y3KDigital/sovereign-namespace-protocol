/**
 * Blockchain Registry API - Register Namespace
 * Wraps UnyKorn L1 NamespaceRegistry
 */

interface Env {
  GENESIS_CERTIFICATES: any;
}

interface NamespaceRegistration {
  namespace: string;
  controller: string;
  metadata_hash: string;
}

export async function onRequestPost(context: any) {
  try {
    const body = await context.request.json() as NamespaceRegistration;
    const { namespace, controller, metadata_hash } = body;

    // Validate inputs
    if (!namespace || !controller || !metadata_hash) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: namespace, controller, metadata_hash"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate controller is 64-char hex (32 bytes)
    if (!/^[0-9a-fA-F]{64}$/.test(controller)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Controller must be 64-character hex string (32 bytes)"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if namespace already exists
    const existing = await context.env.GENESIS_CERTIFICATES.get(`namespace:${namespace}`);
    if (existing) {
      const existingData = JSON.parse(existing);
      return new Response(JSON.stringify({
        success: false,
        error: `namespace already exists: ${namespace}`,
        existing_controller: existingData.controller
      }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Register namespace
    const registration = {
      namespace,
      controller,
      metadata_hash,
      registered_at: new Date().toISOString()
    };

    await context.env.GENESIS_CERTIFICATES.put(
      `namespace:${namespace}`,
      JSON.stringify(registration)
    );

    // Calculate commitment hash (simple hash for now)
    const commitment_hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(registration))
    );
    const commitment_hex = Array.from(new Uint8Array(commitment_hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return new Response(JSON.stringify({
      success: true,
      namespace,
      commitment_hash: commitment_hex
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
