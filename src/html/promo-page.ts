import promoStache from "../../views/promo.mustache";
import Mustache from "mustache";
import { Promo } from "../promo/Promo";

export function createPromoPage({ promoInfo, redeemLink, url }: { promoInfo: Promo, redeemLink: string, url: string }) {
  const today = new Date().toDateString();
  return Mustache.render(promoStache, { promoInfo, redeemLink, url, today });
}
