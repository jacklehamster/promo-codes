import { listSheetsAndFetchData, updateSheetRow } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";


export async function redeemPromo(sheetId: string, promo: Promo, user: string, uid: string, src: string, credentials?: string): Promise<any> {
  promo.Redeemed = new Date().toString();
  promo.UID = uid;
  promo.User = user;
  promo.Source = src;
  return await updateSheetRow(sheetId, [promo], {
    credentials,
    sheet: promo.sheet,
  });
}

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
