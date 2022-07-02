type Cipher = {
  iv: Uint8Array;
  text: ArrayBufferLike;
};

const encodeText = (text: string) => {
  const enc = new TextEncoder();
  return enc.encode(text);
};

const decodeText = (decrypted: ArrayBuffer) => {
  const dec = new TextDecoder();
  return dec.decode(decrypted);
};

const arrayBufferToHex = (buffer: ArrayBuffer, separator = '') => {
  return new Uint8Array(buffer)
    .reduce<string[]>((a, b) => [...a, b.toString(16).padStart(2, '0')], [])
    .join(separator);
};

const hexToArrayBuffer = (hexEncodedString: string) => {
  const octets = hexEncodedString.match(/[\da-f]{2}/gi);

  if (octets) {
    return new Uint8Array(octets.map((h) => parseInt(h, 16)));
  }

  return new Uint8Array();
};

const getRandomIV = () => window.crypto.getRandomValues(new Uint8Array(12));

export const parseCipher = (serializedCipher: string): Cipher => {
  const [ciphertextAsBase64, ivAsBase64] = serializedCipher.split(' ');

  const iv = new Uint8Array(hexToArrayBuffer(ivAsBase64));
  const ciphertext = hexToArrayBuffer(ciphertextAsBase64);

  return { iv, text: ciphertext };
};

export const serializeCipher = (cipher: Cipher) => {
  const ivAsBase64 = arrayBufferToHex(cipher.iv.buffer);
  const ciphertextAsBase64 = arrayBufferToHex(cipher.text);

  return `${ciphertextAsBase64} ${ivAsBase64}`;
};

export const generateKeyPair = () => {
  return window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-384',
    },
    true,
    ['deriveKey']
  );
};

export const deriveSecretKey = (privateKey: CryptoKey, publicKey: CryptoKey) => {
  return window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

export const exportKey = async (key: CryptoKey) => {
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToHex(rawKey);
};

export const importKey = (hexEncodedKey: string) => {
  const rawKey = hexToArrayBuffer(hexEncodedKey);

  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'ECDH',
      namedCurve: 'P-384',
    },
    true,
    []
  );
};

export const computeHash = async (data: string) => {
  const result = await window.crypto.subtle.digest('sha-256', encodeText(data));
  return arrayBufferToHex(result, '');
};

export const encrypt = async (plaintext: string, key: CryptoKey): Promise<Cipher> => {
  const encoded = encodeText(plaintext);
  const iv = getRandomIV();

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  return { iv, text: ciphertext };
};

export const decrypt = async (cipher: Cipher, key: CryptoKey): Promise<string> => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: cipher.iv,
    },
    key,
    cipher.text
  );

  return decodeText(decrypted);
};
