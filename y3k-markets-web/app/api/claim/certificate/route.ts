
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const CERTIFICATES: Record<string, any> = {
    // 77.x
    '77': {
      id: '0xb5b90415bae271c7d15a36caba150za29zd94e7z5e4eb1e8e0d4a66bz4d6c6e6',
      label: '77.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },
    '77-2026-01-17-z7a2c8d1e5b4928f5ae2d3b4c6a7z8d1': {
      id: '0xb5b90415bae271c7d15a36caba150za29zd94e7z5e4eb1e8e0d4a66bz4d6c6e6',
      label: '77.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },

    // 88.x
    '88': {
      id: '0xc6c01526cbf382d8e26b47dcbc261ab40ae05f8a6f5fc2f8f1e5a77ca5e7d7f7',
      label: '88.x',
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

    // 222.x
    '222': {
      id: '0xd7d12637dce493e9f37c58edcd372bc51bf16g9b7g6gd3g9g2f6b88db6f8e8g8',
      label: '222.x',
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

    // 333.x
    '333': {
      id: '0xe8e23748edd504f0g48d69fee483cd62cg27h0ac8h7he4h0h3g7c99ec7g9f9h9',
      label: '333.x',
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
    },

    // brad.x
    'brad': {
      id: '0xf9f34859fee615g595e80gff594de73dh38i1bd9i8if5i1i4h8da0fd8h0g0i0',
      label: 'brad.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },
    'brad-2026-01-17-br4d89a7b6c5d4e3f2g1h0br4d89': {
      id: '0xf9f34859fee615g595e80gff594de73dh38i1bd9i8if5i1i4h8da0fd8h0g0i0',
      label: 'brad.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },

    // donald.x
    'donald': {
      id: '0x0a045960gff726h606f91hgg605ef84ei49j2ce0j9jg6j2j5i9db1ge9i1h1j1',
      label: 'donald.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    },
    'donald-2026-01-17-d0n4ld89a7b6c5d4e3f2g1h0d0n4ld': {
      id: '0x0a045960gff726h606f91hgg605ef84ei49j2ce0j9jg6j2j5i9db1ge9i1h1j1',
      label: 'donald.x',
      sovereignty: 'Immutable',
      genesis_hash: '0x6787f9320ad087315948d2b60c210c674dc1844f451436a9f25156f9d54096fc',
      depth: 0
    }
  };

  try {
    const { token } = await request.json();
    const certificate = CERTIFICATES[token];

    if (!certificate) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Certificate error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
