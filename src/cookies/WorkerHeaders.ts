import { CookieStore } from "./CookieStore";

export class WorkerHeaders {
  readonly requestCookies: Record<string, any>;
  readonly responseCookies: string[] = [];

  constructor(requestHeaders: Headers & { cookie?: string }, readonly maxAge: number = 300) {
    this.requestCookies = Object.fromEntries(
      (requestHeaders.cookie ?? requestHeaders.get?.('Cookie'))?.split('; ').map(c => c.split('=')) ?? []
    );
  }

  getCookieStore(): CookieStore {
    return {
      getCookie: (name: string) => {
        return this.requestCookies[name];
      },
      setCookie: (name: string, value: any) => {
        this.responseCookies.push(`${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${this.maxAge}`);
      },
    };
  }

  getResponseHeader() {
    return {
      "Set-Cookie": this.responseCookies,
    };
  }
}
