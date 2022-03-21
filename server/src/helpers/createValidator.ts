export default <ExpectedRes extends Record<string, any>>(
    expected: ExpectedRes
  ) =>
  <ActualRes extends Record<any, any>>(actual: ActualRes) => {
    const expectedKeyNames = Object.keys(expected) as Array<keyof ExpectedRes>;

    return expectedKeyNames.every((key) => expected[key] === actual[key]);
  };
