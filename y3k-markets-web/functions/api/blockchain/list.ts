/**
 * Blockchain Registry API - List All Namespaces
 */

interface Env {
  GENESIS_CERTIFICATES: any;
}

export async function onRequestGet(context: any) {
  try {
    // List all namespace keys
    const list = await context.env.GENESIS_CERTIFICATES.list({ prefix: "namespace:" });
    
    const namespaces: string[] = [];
    for (const key of list.keys) {
      // Extract namespace from key (remove "namespace:" prefix)
      const namespace = key.name.replace(/^namespace:/, '');
      namespaces.push(namespace);
    }

    return new Response(JSON.stringify({
      namespaces,
      total: namespaces.length
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
