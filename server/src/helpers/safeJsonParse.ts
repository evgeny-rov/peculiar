export default (data: string): Object => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};
