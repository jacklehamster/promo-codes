import { verifyToken, verifyUid } from "../security/security";
import { CookieStore } from "../cookies/CookieStore";
import { redeemPromo } from "./redeemPromo";
import { findPromoForUid } from "./retrievePromo";
import { retrieveFirstPromo } from "./retrieveFirstPromo";
import { validateUIDFromCookie } from "../cookies/get-uid-from-cookie";

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
  const { uid, user } = await validateUIDFromCookie(cookies, sheetId, app, secret) ?? {};
  if (!uid?.length) {
    console.log("Not uid provided.")
    return;
  }

  {
    //  check if User already has a promo. (uid gets extracted from cookies)
    const promo = await findPromoForUid({
      sheetId,
      sheetName,
      app,
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

  const promo = await retrieveFirstPromo(sheetId, {
    sheetName,
    app,
    credentials,
  });

  if (!promo) {
    console.log('No promo code available');
    return undefined;
  } else {
    console.log("Redeeming promo");
    const result = await redeemPromo(sheetId, promo, { user, uid, src: Source }, credentials);
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
