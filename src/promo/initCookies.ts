import { CookieStore } from "../cookies/CookieStore";
import { generateUid, generateToken } from "../security/security";


export async function initCookies({
  sheetId, app, secret,
}: { sheetId: string; app: string; secret: string; }, cookies: CookieStore) {
  const signedUID = cookies.getCookie(`${app}-signedUID`) ?? await generateUid(secret ?? "");
  const token = await generateToken({ app, sheetId, signedUID }, '5m', secret ?? "");

  cookies.setCookie(`${app}-token`, token);
  cookies.setCookie(`${app}-signedUID`, signedUID, 60 * 60 * 24 * 365);
}
