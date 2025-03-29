import { listSheetsAndFetchData } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";


export async function listPromos(sheetId: string, sheetName: string, condition?: (row: Promo) => boolean, credentials?: string) {
  const promos = await listSheetsAndFetchData<Promo>(sheetId, {
    credentials,
    sheet: sheetName,
    condition,
  });
  return promos?.[sheetName];
}
