import { first, last } from "random-name";
import { redeemNextPromo } from "./promo/redeemNextPromo";
import { unredeemPromo } from "./promo/redeemPromo";

const SAMPLE_SHEET_ID = '1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04';
const app = "net.dobuki.worldofturtle";

const promo = await redeemNextPromo(SAMPLE_SHEET_ID, {
  sheetName: app,
  app,
  User: `${first()}-${last()}`.toLowerCase(),
  Source: "test",
  uid: crypto.randomUUID(),
});

console.log("Redeemed:", promo);

await new Promise((resolve) => setTimeout(resolve, 3000));

await unredeemPromo(SAMPLE_SHEET_ID, promo?.Code ?? "", app);
