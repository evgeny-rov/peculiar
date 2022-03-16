export default (data: string) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};
