export interface CookieStore {
  setCookie(name: string, value: any, maxAge?: number): void;
  getCookie(name: string): any;
}
