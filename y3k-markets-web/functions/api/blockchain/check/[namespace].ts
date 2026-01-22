/**
 * Blockchain Registry API - Check Namespace
 * Query if namespace exists
 */

interface Env {
  GENESIS_CERTIFICATES: any;
}

export async function onRequestGet(context: any) {
  try {
    const namespace = context.params.namespace as string;

    if (!namespace) {
      return new Response(JSON.stringify({
        error: "Namespace parameter required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await context.env.GENESIS_CERTIFICATES.get(`namespace:${namespace}`);

    if (!data) {
      return new Response(JSON.stringify({
        exists: false,
        namespace: null
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const registration = JSON.parse(data);

    return new Response(JSON.stringify({
      exists: true,
      namespace: registration
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
