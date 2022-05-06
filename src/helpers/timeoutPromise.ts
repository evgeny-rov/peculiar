const createTimeoutPromise = (ms: number) => new Promise((_, rej) => setTimeout(rej, ms));

export default createTimeoutPromise;
