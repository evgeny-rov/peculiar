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

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const result: string[] = [];
  new Uint8Array(buffer).forEach((byte) => result.push(String.fromCharCode(byte)));
  return window.btoa(result.join(''));
};

const arrayBufferToHex = (buffer: ArrayBuffer, separator = '') => {
  return new Uint8Array(buffer)
    .reduce<string[]>((a, b) => [...a, b.toString(16).padStart(2, '0')], [])
    .join(separator);
};

const base64ToArrayBuffer = (base64: string) => {
  const binary_string = window.atob(base64);
  const result = new Uint8Array(binary_string.length).map((_, idx) =>
    binary_string.charCodeAt(idx)
  );
  return result.buffer;
};

const getRandomIV = () => window.crypto.getRandomValues(new Uint8Array(12));

export const parseCipher = (serializedCipher: string): Cipher => {
  const [ciphertextAsBase64, ivAsBase64] = serializedCipher.split(' ');

  const iv = new Uint8Array(base64ToArrayBuffer(ivAsBase64));
  const ciphertext = base64ToArrayBuffer(ciphertextAsBase64);

  return { iv, text: ciphertext };
};

export const serializeCipher = (cipher: Cipher) => {
  const ivAsBase64 = arrayBufferToBase64(cipher.iv.buffer);
  const ciphertextAsBase64 = arrayBufferToBase64(cipher.text);

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

export const exportKey = (publicKey: CryptoKey) => {
  return window.crypto.subtle.exportKey('jwk', publicKey);
};

export const importKey = (publicKey: JsonWebKey) => {
  return window.crypto.subtle.importKey(
    'jwk',
    publicKey,
    {
      name: 'ECDH',
      namedCurve: 'P-384',
    },
    true,
    []
  );
};

export const getFingerprint = async (data: ArrayBuffer) => {
  const result = await window.crypto.subtle.digest('sha-1', data);
  return arrayBufferToHex(result, '');
};

export const getKeyFingerprint = async (key: CryptoKey) => {
  const raw = await window.crypto.subtle.exportKey('raw', key);
  const result = await getFingerprint(raw);
  return result;
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
