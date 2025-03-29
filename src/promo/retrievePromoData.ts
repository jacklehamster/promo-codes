import { CookieStore } from "../cookies/CookieStore";
import { generateUid, generateToken } from "../security/security";
import { retrieveFirstPromo } from "./retrieveFirstPromo";

export async function retrievePromoData(sheetId: string, { sheetName, app, credentials, secret, user }: {
  sheetName: string;
  app: string;
  secret: string;
  user: string;
  credentials?: string;
}, cookies: CookieStore) {
  const promo = await retrieveFirstPromo(sheetId, {
    sheetName,
    app,
    credentials,
  });
  const signedUID = cookies.getCookie("signedUID") ?? await generateUid(secret ?? "");
  const token = await generateToken({ app, sheetId, user, signedUID }, '5m', secret ?? "");

  cookies.setCookie('user', user);
  cookies.setCookie('token', token);
  cookies.setCookie('signedUID', signedUID, 60 * 60 * 24 * 365);

  return promo ? {
    ...promo,
    Code: undefined,
    sheet: undefined,
    row: undefined,
  } : null;
}
