import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';
import { SignJWT } from 'jose';

export interface FirebaseFixture {
  token: (claims?: Record<string, unknown>, kid?: string) => Promise<string>;
  publicCertificate: string;
  kid: string;
  cleanup: () => void;
}

function der(tag: number, value: Uint8Array): Uint8Array {
  const length = value.byteLength;
  const lengthBytes = length < 128
    ? [length]
    : (() => {
        const bytes: number[] = [];
        let remaining = length;
        while (remaining > 0) { bytes.unshift(remaining & 0xff); remaining >>>= 8; }
        return [0x80 | bytes.length, ...bytes];
      })();
  return Uint8Array.from([tag, ...lengthBytes, ...value]);
}

function joinDer(...parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const joined = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) { joined.set(part, offset); offset += part.byteLength; }
  return joined;
}

function makeTestCertificate(privateKey: KeyObject, publicKey: KeyObject): string {
  const algorithm = der(0x30, Uint8Array.from([
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b,
    0x05, 0x00,
  ]));
  const commonName = der(0x30, der(0x31, der(0x30, joinDer(
    Uint8Array.from([0x06, 0x03, 0x55, 0x04, 0x03]),
    der(0x0c, new TextEncoder().encode('synthetic.firebase.test')),
  ))));
  const now = new Date();
  const utc = (date: Date) => {
    const two = (n: number) => String(n).padStart(2, '0');
    return `${two(date.getUTCFullYear() % 100)}${two(date.getUTCMonth() + 1)}${two(date.getUTCDate())}${two(date.getUTCHours())}${two(date.getUTCMinutes())}${two(date.getUTCSeconds())}Z`;
  };
  const notBefore = new Date(now.getTime() - 60_000);
  const notAfter = new Date(now.getTime() + 86_400_000);
  const validity = der(0x30, joinDer(
    der(0x17, new TextEncoder().encode(utc(notBefore))),
    der(0x17, new TextEncoder().encode(utc(notAfter))),
  ));
  const version = der(0xa0, der(0x02, Uint8Array.from([0x02])));
  const serial = der(0x02, Uint8Array.from([0x01]));
  const subjectPublicKeyInfo = new Uint8Array(publicKey.export({ type: 'spki', format: 'der' }));
  const tbs = der(0x30, joinDer(version, serial, algorithm, commonName, validity, commonName, subjectPublicKeyInfo));
  const signature = new Uint8Array(sign('RSA-SHA256', tbs, privateKey));
  const certificate = der(0x30, joinDer(tbs, algorithm, der(0x03, joinDer(Uint8Array.from([0]), signature))));
  const base64 = Buffer.from(certificate).toString('base64').match(/.{1,64}/g)?.join('\n') ?? '';
  return `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----\n`;
}

export function createFirebaseFixture(): FirebaseFixture {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicCertificate = makeTestCertificate(privateKey, publicKey);
  const kid = 'synthetic-kid';
  return {
    kid,
    publicCertificate,
    token: async (claims = {}, tokenKid = kid) => new SignJWT({
      aud: 'probe-project',
      iss: 'https://securetoken.google.com/probe-project',
      sub: 'uid-alpha',
      email_verified: true,
      auth_time: Math.floor(Date.now() / 1000) - 60,
      ...claims,
    })
      .setProtectedHeader({ alg: 'RS256', kid: tokenKid, typ: 'JWT' })
      .setIssuedAt(typeof claims.iat === 'number' ? claims.iat : undefined)
      .setExpirationTime(Object.hasOwn(claims, 'exp') ? claims.exp as number : '1h')
      .sign(privateKey),
    cleanup: () => undefined,
  };
}
