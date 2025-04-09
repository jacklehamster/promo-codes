import { CookieStore } from "../cookies/CookieStore";
import { createPromoPage } from "../html/promo-page";
import { createFetchFromSheet, FetchPromo } from "./fetchPromoInterface";
import { initCookies } from "./initCookies";
import { Promo } from "./Promo";
import { retrieveFirstPromo } from "./retrieveFirstPromo";

export async function retrievePromoData(sheetId: string, { sheetName, app, credentials, secret, fetchPromo }: {
  sheetName: string;
  app: string;
  secret: string;
  credentials?: string;
  fetchPromo?: FetchPromo,
}, cookies: CookieStore) {
  const promo = await retrieveFirstPromo({
    sheetName,
    app,
    fetchPromo: fetchPromo ?? createFetchFromSheet(sheetId, sheetName, credentials),
  });
  await initCookies({ sheetId, app, secret }, cookies);

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
