import { Promo } from "./Promo";
import { listPromos } from "./listPromos";


export async function retrieveFirstPromo(sheetId: string, { sheetName, app, credentials }: {
  sheetName: string;
  app: string;
  credentials?: string;
}): Promise<Promo | undefined> {
  const promos = await listPromos(sheetId, sheetName, row => {
    return row.sheet === sheetName && !row.Redeemed && row.App === app;
  }, credentials);
  return promos?.[0];
}
