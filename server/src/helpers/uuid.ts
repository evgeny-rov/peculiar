export default (length = 11) => {
  const CHARS_SOURCE =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

  let uid = '';

  for (let i = 0; i < length; i += 1) {
    uid += CHARS_SOURCE[Math.floor(Math.random() * CHARS_SOURCE.length)];
  }

  return uid;
};
