import { listSheetsAndFetchData, updateSheetRow } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";

//  This has no security token or uid, because it's not meant to be called from users

export async function unredeemPromo(sheetId: string, promoCode: string, sheet: string, credentials?: string) {
  const data = await listSheetsAndFetchData(sheetId, {
    sheet,
    condition(row) {
      return row.sheet === sheet && row.Code === promoCode;
    },
    credentials,
  });
  const promo = data?.[sheet]?.[0] as Promo;
  if (promo) {
    promo.Redeemed = "";
    promo.User = "";
    promo.UID = "";
    promo.Source = "";
    const result = await updateSheetRow(sheetId, [promo], {
      sheet,
      credentials,
    });
    if (result?.[0]?.updatedRows) {
      console.log("Promo code unredeemed");
    } else {
      console.log("Error unredeeming promo code");
    }
  } else {
    console.log("Promo code not found");
  }
}
