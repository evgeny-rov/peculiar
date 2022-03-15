export default <T>(
  initialState: T
): { set: (nextState: T) => void; get: () => T } => {
  let state = initialState;

  return {
    set: (value) => {
      state = value;
    },
    get: () => state,
  };
};
