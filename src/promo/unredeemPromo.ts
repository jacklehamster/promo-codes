import { Promo } from "./Promo";
import { UpdatePromo } from "./updatePromoInterface";
import { FetchPromo } from "./fetchPromoInterface";

//  This has no security token or uid, because it's not meant to be called from users

export async function unredeemPromo(promoCode: string, sheet: string, { updatePromo, fetchPromo }: {
  updatePromo: UpdatePromo,
  fetchPromo: FetchPromo,
}) {
  const data = await fetchPromo((row) => {
    return row.sheet === sheet && row.Code === promoCode;
  });
  const promo = data?.[0] as Promo;
  if (promo) {
    promo.Redeemed = "";
    promo.User = "";
    promo.UID = "";
    promo.Source = "";
    const result = await updatePromo(promo);
    if (result) {
      console.log("Promo code unredeemed");
    } else {
      console.log("Error unredeeming promo code");
    }
  } else {
    console.log("Promo code not found");
  }
}
