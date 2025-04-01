import { Promo } from "./Promo";
import { FetchPromo } from "./fetchPromoInterface";


export async function retrieveFirstPromo({ sheetName, app, fetchPromo }: {
  sheetName: string;
  app: string;
  fetchPromo: FetchPromo;
}): Promise<Promo | undefined> {
  const promos = await fetchPromo(row => {
    return row.sheet === sheetName && !row.Redeemed && row.App === app && !row.Hidden;
  });
  return promos?.[0];
}
