import { CookieStore } from "../cookies/CookieStore";
import { createPromoPage } from "../html/promo-page";
import { generateUid, generateToken } from "../security/security";
import { createFetchFromSheet, FetchPromo } from "./fetchPromoInterface";
import { Promo } from "./Promo";
import { retrieveFirstPromo } from "./retrieveFirstPromo";

export async function retrievePromoData(sheetId: string, { sheetName, app, credentials, secret, user, fetchPromo }: {
  sheetName: string;
  app: string;
  secret: string;
  user: string;
  credentials?: string;
  fetchPromo?: FetchPromo,
}, cookies: CookieStore) {
  const promo = await retrieveFirstPromo({
    sheetName,
    app,
    fetchPromo: fetchPromo ?? createFetchFromSheet(sheetId, sheetName, credentials),
  });
  const signedUID = cookies.getCookie(`${app}-signedUID`) ?? await generateUid(secret ?? "");
  const token = await generateToken({ app, sheetId, signedUID }, '5m', secret ?? "");

  cookies.setCookie(`${app}-token`, token);
  cookies.setCookie(`${app}-signedUID`, signedUID, 60 * 60 * 24 * 365);

  return promo ? {
    ...promo,
    Code: undefined,
    sheet: undefined,
    row: undefined,
    createPage(url: string, redeemLink: string) {
      return createPromoPage({ promoInfo: this as unknown as Promo, redeemLink, url });
    }
  } : undefined;
}
