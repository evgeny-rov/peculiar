const getSessionContextFromUrl = ({ hash }: Location) => {
  if (hash.length > 0) return hash.slice(1);

  return null;
};

export default getSessionContextFromUrl;
