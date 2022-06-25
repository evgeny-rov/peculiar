const getSessionContextFromUrl = (pathname: string) => {
  const [, context] = pathname.split('/');

  if (context.length > 0) return context;

  return null;
};

export default getSessionContextFromUrl;
