const createPromiseWithTimeout = (
  originalPromise: Promise<any>,
  timeoutMessage: string,
  ms: number
) => {
  const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(Error(timeoutMessage)), ms));
  return Promise.race([originalPromise, timeoutPromise]);
};

export default createPromiseWithTimeout;
