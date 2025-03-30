import { redeemNextPromo } from "./promo/redeemNextPromo";
import { retrievePromoData } from "./promo/retrievePromoData";
import { findPromoForUid } from "./promo/findPromoForUid";


let urlencoded: any;

try {
  // These will fail in Workers but work in Node.js
  urlencoded = (await import('express')).urlencoded;
} catch (e: any) {
  console.log('Node.js-specific imports unavailable:', e.message);
}


import { config } from "dotenv";
import { WorkerHeaders } from "./cookies/WorkerHeaders";
import { createFetchFromSheet } from "./promo/fetchPromoInterface";
import { createNoPromoPage } from "./html/no-promo-page";
import { createUpdateSheet } from "./promo/updatePromoInterface";
// import { Application, urlencoded } from "express";

config();

const spreadsheetId = process.env.SPREADSHEET_ID ?? "1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04";

const SECRET = process.env.SECRET_WORD ?? "secret";

export async function attachPromoCodes(app: any, route: string = "/promo") {
  if (!spreadsheetId?.length) {
    console.log("No spreadsheet available");
    return;
  }

  app.use(urlencoded({ extended: true }));

  app.get(`${route}/:app_id`, async (req: any, res: any) => {
    const appId = req.params.app_id;

    const workerHeaders = new WorkerHeaders(req.headers);
    const promoInfo = await retrievePromoData(spreadsheetId, {
      sheetName: appId,
      app: appId,
      secret: SECRET,
      user: req.query.user?.toString() ?? "none",
    }, workerHeaders.getCookieStore());

    if (promoInfo) {
      res.setHeader('Set-Cookie', workerHeaders.responseCookies);
      res.send(promoInfo.createPage(`${route}/${appId}/redeem`));
    } else {
      res.send(createNoPromoPage({ appId }));
    }
  });

  app.post(`${route}/:app_id/redeem`, async (req: any, res: any) => {
    const appId = req.params.app_id;
    const src = req.body.src;

    const workerHeaders = new WorkerHeaders(req.headers);
    const promoInfo = await redeemNextPromo(spreadsheetId, {
      sheetName: appId,
      app: appId,
      Source: src,
      secret: SECRET,
      fetchPromo: createFetchFromSheet(spreadsheetId, appId, undefined),
      updatePromo: createUpdateSheet(spreadsheetId, undefined),
    }, workerHeaders.getCookieStore());
    if (promoInfo) {
      res.setHeader('Set-Cookie', workerHeaders.responseCookies);
      res.redirect(`${route}/${appId}/redeem`);
    } else {
      res.send(createNoPromoPage({ appId }));
    }
  });

  app.get(`${route}/:app_id/redeem`, async (req: any, res: any) => {
    const app = req.params.app_id;
    const workerHeaders = new WorkerHeaders(req.headers);
    const promoInfo = await findPromoForUid({
      sheetId: spreadsheetId,
      app,
      secret: SECRET,
      fetchPromo: createFetchFromSheet(spreadsheetId, app, undefined),
    }, workerHeaders.getCookieStore());
    if (promoInfo) {
      res.setHeader('Set-Cookie', workerHeaders.responseCookies);
      res.send(promoInfo.createPage());
    } else {
      res.redirect(`${route}/${app}`);
    }
  });
}

export { retrievePromoData, redeemNextPromo, findPromoForUid, WorkerHeaders, createFetchFromSheet, createUpdateSheet };
export { createNoPromoPage };
