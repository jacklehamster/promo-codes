import { Promo } from "./Promo";
import { UpdatePromo } from "./updatePromoInterface";


export async function redeemPromo(
  promo: Promo,
  { uid, user, src }: { user: string, uid: string, src: string },
  updatePromo: UpdatePromo): Promise<boolean> {
  promo.Redeemed = new Date().toString();
  promo.UID = uid;
  promo.User = user;
  promo.Source = src;
  return await updatePromo(promo);
}
