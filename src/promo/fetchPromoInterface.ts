import { listSheetsAndFetchData, Row } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";

export type FetchPromo = (condition: (row: Promo) => boolean) => Promise<Promo[]>;

type ListSheetsMethod = typeof listSheetsAndFetchData<Promo>;

export function createFetchFromSheet(sheetId: string, sheetName: string, credentials: string | undefined, listSheetsMethod?: ListSheetsMethod): FetchPromo {
  return async (condition: (row: Promo) => boolean) => {
    const promos = await (listSheetsMethod ?? listSheetsAndFetchData<Promo>)(sheetId, {
      credentials,
      sheet: sheetName,
      condition,
    });
    return promos?.[sheetName] ?? [];
  };
}
