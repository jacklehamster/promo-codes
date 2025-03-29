import { redeemNextPromo } from "./promo/redeemNextPromo";
import { unredeemPromo } from "./promo/unredeemPromo";

import { config } from "dotenv";
import { generateUid } from "./security/security";

config();
const SECRET = process.env.SECRET_WORD ?? "secret";

const SAMPLE_SHEET_ID = '1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04';
const app = "net.dobuki.worldofturtle";

const signedUID = await generateUid(SECRET);
const promo = await redeemNextPromo(SAMPLE_SHEET_ID, {
  sheetName: app,
  app,
  Source: "test",
  secret: SECRET,
}, {
  getCookie(name: string) {
    if (name === "signedUID") {
      return signedUID;
    }
    if (name === "user") {
      return "test-user";
    }
  },
  setCookie() {
  }
});

console.log("Redeemed:", promo);

await new Promise((resolve) => setTimeout(resolve, 3000));

await unredeemPromo(SAMPLE_SHEET_ID, promo?.Code ?? "", app);
