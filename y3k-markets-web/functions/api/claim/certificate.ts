// Certificate retrieval
export async function onRequestPost(context: any) {
  const CERTIFICATES: Record<string, any> = {
    '77-2026-01-17-z7a2c8d1e5b4928f5ae2d3b4c6a7z8d1': {
      id: '0xb5b90415bae271c7d15a36caba150za29zd94e7z5e4eb1e8e0d4a66bz4d6c6e6',
      label: '77.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },
    '88-2026-01-17-a8f3d9e2b4c7891a6fd2e3b5c4f7a8d9': {
      id: '0xc6c01526cbf382d8e26b47dcbc261ab40ae05f8a6f5fc2f8f1e5a77ca5e7d7f7',
      label: '88.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },
    '222-2026-01-17-b9g4e0f3c5d8902b7ge3f4c6d5g8b9e0': {
      id: '0xd7d12637dce493e9f37c58edcd372bc51bf16g9b7g6gd3g9g2f6b88db6f8e8g8',
      label: '222.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },
    '333-2026-01-17-c0h5f1d4e6f9013c8hf4g5d7e6h9c0f1': {
      id: '0xe8e23748edd504f0g48d69fee483cd62cg27h0ac8h7he4h0h3g7c99ec7g9f9h9',
      label: '333.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    }
  };

  try {
    const { token } = await context.request.json();
    const certificate = CERTIFICATES[token];

    if (!certificate) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(certificate), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
