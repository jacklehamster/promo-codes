import { JWTPayload, SignJWT, jwtVerify } from 'jose';

export interface Payload extends JWTPayload {
  app: string;
  sheetId: string;
  signedUID: string;
}

export async function generateToken(payload: Payload, expiresIn: string = '5m', secret: string): Promise<string> {
  if (!secret.length) {
    throw new Error("Secret needed.");
  }
  const key = new TextEncoder().encode(secret);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // HMAC SHA-256 algorithm
    .setIssuedAt() // Issued at time (iat)
    .setExpirationTime(expiresIn) // Expiration time (e.g., '5m' for 5 minutes)
    .setNotBefore(0) // Token is valid immediately
    .sign(key);
}

export async function verifyToken(token: string | undefined, secret: string | undefined): Promise<Payload | null> {
  if (!token || !secret) {
    return null;
  }
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify<Payload>(token, key, {
      algorithms: ['HS256'], // Ensure the algorithm matches
      requiredClaims: ['iat', 'exp'], // Require issued-at and expiration
    });
    return payload;
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// Use the Web Crypto API, available in Cloudflare Workers
const encoder = new TextEncoder();

// Generate a short UID and sign it with HMAC-SHA256
export async function generateUid(secret: string): Promise<string> {
  const uid = self.crypto.randomUUID();
  const key = await self.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await self.crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(uid)
  );
  // Convert signature to hex
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  // Return UID and signature as "uid:signature"
  return `${uid}:${signatureHex}`;
}

// Validate a UID by recomputing the HMAC and comparing
export async function verifyUid(uidWithSignature: string | undefined, secret: string | undefined): Promise<string | null> {
  if (!secret?.length) {
    return null;
  }
  const [uid, signatureHex] = uidWithSignature?.split(':') ?? [];
  if (!uid || !signatureHex) {
    return null; // Invalid format
  }

  const key = await self.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const computedSignature = await self.crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(uid)
  );
  const computedSignatureHex = Array.from(new Uint8Array(computedSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (computedSignatureHex === signatureHex) {
    return uid; // Valid UID
  }
  return null; // Invalid signature
}
