import { redeemNextPromo } from "./promo/redeemNextPromo";
import { unredeemPromo } from "./promo/unredeemPromo";

import { config } from "dotenv";
import { generateToken, generateUid } from "./security/security";
import { createUpdateSheet } from "./promo/updatePromoInterface";
import { createFetchFromSheet } from "./promo/fetchPromoInterface";

config();
const SECRET = process.env.SECRET_WORD ?? "secret";

const SAMPLE_SHEET_ID = '1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04';
const app = "net.dobuki.worldofturtle";
const user = "test-user";

const signedUID = await generateUid(SECRET);
const token = await generateToken({ app, sheetId: SAMPLE_SHEET_ID, user, signedUID }, '5s', SECRET);

const fetchPromo = createFetchFromSheet(SAMPLE_SHEET_ID, app, undefined);
const updatePromo = createUpdateSheet(SAMPLE_SHEET_ID, undefined);

const promo = await redeemNextPromo(SAMPLE_SHEET_ID, {
  sheetName: app,
  app,
  Source: "test",
  secret: SECRET,
  fetchPromo,
  updatePromo,
}, {
  getCookie(name: string) {
    if (name === "signedUID") {
      return signedUID;
    }
    if (name === "user") {
      return user;
    }
    if (name === "token") {
      return token;
    }
  },
  setCookie() {
  }
});


await new Promise((resolve) => setTimeout(resolve, 3000));

await unredeemPromo(promo?.Code ?? "", app, {
  fetchPromo,
  updatePromo,
});
