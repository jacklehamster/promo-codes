import { verifyToken, verifyUid } from "../security/security";
import { CookieStore } from "../cookies/CookieStore";
import { redeemPromo } from "./redeemPromo";
import { findPromoForUid, retrievePromo } from "./retrievePromo";

interface Props {
  sheetName: string;
  app: string;
  Source: string;
  credentials?: string;
  secret: string;
  token?: string;
}

export async function redeemNextPromo(sheetId: string,
  { sheetName, app, Source, credentials, secret }: Props,
  cookies: CookieStore
) {
  const signedUID = cookies.getCookie("signedUID");
  const user = cookies.getCookie("user");
  const token = cookies.getCookie("token");
  if (token) {
    const payload = await verifyToken(token, secret ?? "");
    if (!payload || payload.app !== app || payload.sheetId !== sheetId || payload.user !== user || payload.signedUID !== signedUID) {
      return;
    }
  }
  const uid = await verifyUid(signedUID ?? "", secret ?? "") ?? "";
  if (!uid.length) {
    console.log("Not uid provided.")
    return;
  }

  {
    //  check if User already has a promo.
    const promo = await findPromoForUid({
      sheetId,
      sheetName,
      app,
      signedUID,
      credentials,
      secret,
    }, cookies);
    if (promo) {
      return {
        ...promo,
        row: undefined,
        sheet: undefined,

      };
    }
  }

  const promo = await retrievePromo({
    sheetId,
    sheetName,
    app,
    credentials,
  });

  if (!promo) {
    console.log('No promo code available');
    return undefined;
  } else {
    console.log("Redeeming promo");
    const result = await redeemPromo(sheetId, promo, user, uid, Source, credentials);
    if (!result?.[0]?.updatedRows) {
      return undefined;
    }
  }
  return {
    ...promo,
    row: undefined,
    sheet: undefined,
  };
}
