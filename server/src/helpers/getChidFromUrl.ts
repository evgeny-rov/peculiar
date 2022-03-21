import { parse } from 'url';

export default (reqUrl: string | undefined) => {
  if (reqUrl === undefined) {
    return null;
  }

  const { pathname } = parse(reqUrl, true);

  if (pathname === null) {
    return null;
  }

  const [, chid] = pathname.split('/');

  if (!chid) {
    return null;
  }

  return chid;
};
