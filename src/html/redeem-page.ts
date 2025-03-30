
import redeemStache from "../../views/redeem.mustache";
import Mustache from "mustache";
import linkifyHtml from "linkify-html";
import { Promo } from "../promo/Promo";

export function createRedeemPage({ promoInfo, url }: { promoInfo: Promo; url: string }) {
  const instructions = linkifyHtml(promoInfo.Instructions, {
    target: '_blank',
    defaultProtocol: 'https',
  });
  return Mustache.render(redeemStache, { promoInfo, instructions, url });
}
