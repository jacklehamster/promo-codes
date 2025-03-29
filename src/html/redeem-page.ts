
import redeemStache from "../../views/redeem.mustache";
import Mustache from "mustache";
import linkifyHtml from "linkify-html";
import { Promo } from "../promo/Promo";

export function createRedeemPage({ promoInfo }: { promoInfo: Promo }) {
  const instructions = linkifyHtml(promoInfo.Instructions, {
    target: '_blank',
    defaultProtocol: 'https',
  });
  return Mustache.render(redeemStache, { promoInfo, instructions });
}
