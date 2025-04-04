import { CookieStore } from "../cookies/CookieStore";
import { redeemPromo } from "./redeemPromo";
import { findPromoForUid } from "./findPromoForUid";
import { retrieveFirstPromo as retrieveFirstAvailablePromo } from "./retrieveFirstPromo";
import { validateUIDFromCookie } from "../cookies/get-uid-from-cookie";
import { createFetchFromSheet, FetchPromo } from "./fetchPromoInterface";
import { createUpdateSheet, UpdatePromo } from "./updatePromoInterface";

interface Props {
  sheetName: string;
  app: string;
  src: string;
  email?: string;
  credentials?: string;
  secret: string;
  token?: string;
  fetchPromo?: FetchPromo;
  updatePromo?: UpdatePromo;
}

export async function redeemNextPromo(sheetId: string,
  { sheetName, app, src, credentials, secret, fetchPromo, updatePromo, email }: Props,
  cookies: CookieStore
) {
  const { uid } = await validateUIDFromCookie(cookies, sheetId, app, secret) ?? {};
  if (!uid?.length) {
    console.log("No uid provided.")
    return;
  }

  const fetchPromoCall = fetchPromo ?? createFetchFromSheet(sheetId, sheetName, credentials);

  {
    //  check if User already has a promo. (uid gets extracted from cookies)
    const promo = await findPromoForUid({
      sheetId,
      app,
      secret,
      fetchPromo: fetchPromoCall,
    }, cookies);
    if (promo) {
      return {
        ...promo,
        row: undefined,
        sheet: undefined,
      };
    }
  }

  const promo = await retrieveFirstAvailablePromo({
    sheetName,
    app,
    fetchPromo: fetchPromoCall,
  });

  if (!promo) {
    console.log('No promo code available');
    return undefined;
  } else {
    console.log("Redeeming promo");
    const updatePromoCall = updatePromo ?? createUpdateSheet(sheetId, credentials);
    if (email) {
      cookies.setCookie(`${app}-user`, email);
    }

    const user = email ?? cookies.getCookie(`${app}-user`);
    const result = await redeemPromo(promo, { user, uid, src }, updatePromoCall);
    if (!result) {
      return undefined;
    }
  }
  return {
    ...promo,
    row: undefined,
    sheet: undefined,
  };
}
