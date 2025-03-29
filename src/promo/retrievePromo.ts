import { Promo } from "./Promo";
import { CookieStore } from "../cookies/CookieStore";
import format from "string-template";
import { listPromos } from "./listPromos";
import { validateUIDFromCookie } from "../cookies/get-uid-from-cookie";

interface Prop {
  sheetId: string;
  sheetName: string;
  app: string;
  credentials?: string;
  secret: string;
}

export async function findPromoForUid({ sheetId, sheetName, app, credentials, secret }: Prop, cookies: CookieStore): Promise<Promo | undefined> {
  const { uid } = await validateUIDFromCookie(cookies, sheetId, app, secret);
  if (!uid) {
    return undefined;
  }

  const promos = await listPromos(sheetId, sheetName, row => {
    return row.UID === uid && row.App === app;
  }, credentials);

  const promo = promos?.[0];
  return !promo ? undefined : {
    ...promo,
    storeLink: promo.ButtonLink ? format(promo.ButtonLink, promo) : undefined,
  };
}
