import { updateSheetRow } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";

export type UpdatePromo = (promo: Promo) => Promise<boolean>;

type UpdateSheetRowMethod = typeof updateSheetRow<Promo>;

export function createUpdateSheet(sheetId: string, credentials: string | undefined, updateSheetRowMethod?: UpdateSheetRowMethod): UpdatePromo {
  return async (promo: Promo) => {
    const result = await (updateSheetRowMethod ?? updateSheetRow<Promo>)(sheetId, [promo], {
      credentials,
      sheet: promo.sheet,
    });
    return Boolean(result?.totalUpdatedRows);
  };
}
