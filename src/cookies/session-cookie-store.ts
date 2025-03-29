interface Request {
  session: Record<string, any>;
}

export function getSessionBasedCookieStore(req: Request) {
  return {
    setCookie(name: string, value: any) {
      req.session[name] = value;
    },
    getCookie(name: string) {
      return req.session[name];
    }
  };
}
