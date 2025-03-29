import { listSheetsAndFetchData, Row } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";

export type FetchPromo = (condition: (row: Row) => boolean) => Promise<Promo[]>;

type ListSheetsMethod = typeof listSheetsAndFetchData;


export function createFetchFromSheet(sheetId: string, sheetName: string, credentials: string | undefined, listSheetsMethod?: ListSheetsMethod): FetchPromo {
  return async (condition: (row: Row) => boolean) => {
    const promos = await (listSheetsMethod ?? listSheetsAndFetchData<Promo>)(sheetId, {
      credentials,
      sheet: sheetName,
      condition,
    });
    return promos?.[sheetName] ?? [];
  };
}
