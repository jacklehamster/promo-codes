import { listSheetsAndFetchData } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";
import { generateToken, generateUid, verifyUid } from "../security/security";
import { CookieStore } from "../cookies/CookieStore";
import format from "string-template";

interface Prop {
  sheetId: string;
  sheetName: string;
  app: string;
  signedUID?: string;
  credentials?: string;
  secret: string;
}

export async function retrievePromo({ sheetId, sheetName, app, credentials }: {
  sheetId: string;
  sheetName: string;
  app: string;
  credentials?: string;
}): Promise<Promo | undefined> {
  const data = await listSheetsAndFetchData(sheetId, {
    sheet: sheetName,
    condition(row) {
      return row.sheet === sheetName && !row.Redeemed && row.App === app;
    },
    credentials,
  });
  return data?.[sheetName]?.[0] as Promo;
}

export async function findPromoForUid({ sheetId, sheetName, app, credentials, secret }: Prop, cookies: CookieStore): Promise<Promo | undefined> {
  const signedUID = cookies.getCookie("signedUID");

  const uid = await verifyUid(signedUID ?? "", secret ?? "");
  const data = await listSheetsAndFetchData(sheetId, {
    sheet: sheetName,
    condition(row) {
      return row.UID === uid && row.App === app;
    },
    credentials,
  });
  const promo = data?.[sheetName]?.[0] as Promo;
  return !promo ? undefined : {
    ...promo,
    storeLink: promo.ButtonLink ? format(promo.ButtonLink, promo) : undefined,
  };
}
export async function retrievePromoData(sheetId: string, { sheetName, app, credentials, secret, user }: {
  sheetName: string;
  app: string;
  secret: string;
  user: string;
  credentials?: string;
}, cookies: CookieStore) {
  const promo = await retrievePromo({
    sheetId,
    sheetName,
    app,
    credentials,
  });
  const signedUID = cookies.getCookie("signedUID") ?? await generateUid(secret ?? "");
  const token = await generateToken({ app, sheetId, user, signedUID }, '5m', secret ?? "");

  cookies.setCookie('user', user);
  cookies.setCookie('token', token);
  cookies.setCookie('signedUID', signedUID);

  return promo ? {
    ...promo,
    Code: undefined,
    sheet: undefined,
    row: undefined,
  } : null;
}
