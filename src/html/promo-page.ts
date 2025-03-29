import promoStache from "../../views/promo.mustache";
import Mustache from "mustache";
import { Promo } from "../promo/Promo";

export function createPromoPage({ promoInfo, redeemLink }: { promoInfo: Promo, redeemLink: string }) {
  return Mustache.render(promoStache, { promoInfo, redeemLink });
}
