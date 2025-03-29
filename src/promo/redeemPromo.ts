import { updateSheetRow } from "@dobuki/google-sheet-db";
import { Promo } from "./Promo";


export async function redeemPromo(
  sheetId: string,
  promo: Promo,
  { uid, user, src }: { user: string, uid: string, src: string },
  credentials?: string): Promise<any> {
  promo.Redeemed = new Date().toString();
  promo.UID = uid;
  promo.User = user;
  promo.Source = src;
  return await updateSheetRow(sheetId, [promo], {
    credentials,
    sheet: promo.sheet,
  });
}
