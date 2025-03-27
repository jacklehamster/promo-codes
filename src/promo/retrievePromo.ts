import { listSheetsAndFetchData } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";

interface Prop {
  sheetId: string;
  sheetName: string;
  app: string;
  uid?: string;
}

export async function retrievePromo({ sheetId, sheetName, app }: Prop): Promise<Promo | undefined> {
  const data = await listSheetsAndFetchData(sheetId, (row) => {
    return row.sheet === sheetName && !row.Redeemed && row.App === app;
  }, {
    sheet: sheetName,
  });
  return data?.[sheetName][0] as Promo;
}

export async function findPromoForUid({ sheetId, sheetName, app, uid }: Prop): Promise<Promo | undefined> {
  const data = await listSheetsAndFetchData(sheetId, (row) => {
    return row.sheet === sheetName && row.UID === uid && row.App === app;
  }, {
    sheet: sheetName,
  });
  return data?.[sheetName][0] as Promo;
}
