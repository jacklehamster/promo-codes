import { redeemPromo } from "./redeemPromo";
import { findPromoForUid, retrievePromo } from "./retrievePromo";

interface Props {
  sheetName: string;
  app: string;
  User: string;
  Source: string;
  uid?: string;
  credentials?: string;
}

export async function retrievePromoData(sheetId: string, { sheetName, app, credentials }: {
  sheetName: string;
  app: string;
  credentials?: string;
}) {
  const promo = await retrievePromo({
    sheetId,
    sheetName,
    app,
    credentials,
  });
  return promo ? {
    ...promo,
    Code: undefined,
    sheet: undefined,
    row: undefined,
  } : null;
}

export async function redeemNextPromo(sheetId: string, { sheetName, app, User, Source, uid, credentials }: Props) {
  if (!uid) {
    console.log("Not uid provided.")
    return;
  }
  {
    //  check if User already has a promo.
    const promo = await findPromoForUid({
      sheetId,
      sheetName,
      app,
      uid,
      credentials,
    });
    if (promo) {
      return promo;
    }
  }

  const promo = await retrievePromo({
    sheetId,
    sheetName,
    app,
    uid,
    credentials,
  });

  if (!promo) {
    console.log('No promo code available');
    return undefined;
  } else {
    const result = await redeemPromo(sheetId, promo, User, uid, Source, credentials);
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
