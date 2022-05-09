const getSessionIdFromPathname = (pathname: string) => {
  const [, sid] = pathname.split('/');

  if (sid.length > 0) return sid;

  return null;
};

export default getSessionIdFromPathname;
