import { Promo } from "./Promo";
import { CookieStore } from "../cookies/CookieStore";
import format from "string-template";
import { validateUIDFromCookie } from "../cookies/get-uid-from-cookie";
import { FetchPromo } from "./fetchPromoInterface";
import { createRedeemPage } from "../html/redeem-page";

interface Prop {
  sheetId: string;
  app: string;
  secret: string;
  fetchPromo: FetchPromo;
}

export async function findPromoForUid({
  sheetId, app, secret,
  fetchPromo,
}: Prop, cookies: CookieStore): Promise<Promo | undefined> {
  const { uid } = await validateUIDFromCookie(cookies, sheetId, app, secret);
  if (!uid) {
    return undefined;
  }
  const promos = await fetchPromo(row => {
    return row.UID === uid && row.App === app;
  });

  const promo = promos?.[0];
  return !promo ? undefined : {
    ...promo,
    storeLink: promo.ButtonLink ? format(promo.ButtonLink, promo) : undefined,
    createPage() {
      return createRedeemPage({ promoInfo: promo });
    }
  };
}
