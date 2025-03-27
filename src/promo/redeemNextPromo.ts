import { redeemPromo } from "./redeemPromo";
import { findPromoForUid, retrievePromo } from "./retrievePromo";

interface Props {
  sheetName: string;
  app: string;
  User: string;
  Source: string;
  uid?: string;
}

export async function retrievePromoData(sheetId: string, { sheetName, app }: {
  sheetName: string;
  app: string;
}) {
  const promo = await retrievePromo({
    sheetId,
    sheetName,
    app,
  });
  return promo ? {
    ...promo,
    Code: undefined,
    sheet: undefined,
    row: undefined,
  } : null;
}

export async function redeemNextPromo(sheetId: string, { sheetName, app, User, Source, uid }: Props) {
  if (!uid) {
    return;
  }
  {
    //  check if User already has a promo.
    const promo = await findPromoForUid({
      sheetId,
      sheetName,
      app,
      uid,
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
  });

  if (!promo) {
    console.log('No promo code available');
    return undefined;
  } else {
    const result = await redeemPromo(sheetId, promo, User, uid, Source);
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
