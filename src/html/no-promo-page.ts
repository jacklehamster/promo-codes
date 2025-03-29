import nopromoStache from "../../views/nopromo.mustache";
import Mustache from "mustache";

export function createNoPromoPage({ appId }: { appId: string }) {
  return Mustache.render(nopromoStache, { appId });
}
