export interface CookieStore {
  setCookie(name: string, value: any): void;
  getCookie(name: string): any;
}
