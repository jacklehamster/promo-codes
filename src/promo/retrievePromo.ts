import { listSheetsAndFetchData } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";

interface Prop {
  sheetId: string;
  sheetName: string;
  app: string;
  uid?: string;
  credentials?: string;
}

export async function retrievePromo({ sheetId, sheetName, app, credentials }: Prop): Promise<Promo | undefined> {
  const data = await listSheetsAndFetchData(sheetId, {
    sheet: sheetName,
    condition(row) {
      return row.sheet === sheetName && !row.Redeemed && row.App === app;
    },
    credentials,
  });
  return data?.[sheetName][0] as Promo;
}

export async function findPromoForUid({ sheetId, sheetName, app, uid, credentials }: Prop): Promise<Promo | undefined> {
  const data = await listSheetsAndFetchData(sheetId, {
    sheet: sheetName,
    condition(row) {
      return row.sheet === sheetName && row.UID === uid && row.App === app;
    },
    credentials,
  });
  return data?.[sheetName][0] as Promo;
}
