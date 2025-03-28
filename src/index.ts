import { redeemNextPromo } from "./promo/redeemNextPromo";
import { retrievePromoData } from "./promo/retrievePromoData";
import { findPromoForUid } from "./promo/retrievePromo";

import promoStache from "../views/promo.mustache";
import nopromoStache from "../views/nopromo.mustache";
import redeemStache from "../views/redeem.mustache";
import Mustache from "mustache";

let urlencoded: any;
let linkifyHtml: any;

try {
  // These will fail in Workers but work in Node.js
  urlencoded = (await import('express')).urlencoded;
  linkifyHtml = (await import('linkify-html')).default;
} catch (e: any) {
  console.log('Node.js-specific imports unavailable:', e.message);
}


import { config } from "dotenv";
import { WorkerHeaders } from "./cookies/WorkerHeaders";
// import { Application, urlencoded } from "express";
// import linkifyHtml from 'linkify-html';

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
      const html = Mustache.render(promoStache, { promoInfo, route, source: req.query.src ?? "none" });
      res.send(html);
    } else {
      const html = Mustache.render(nopromoStache, { appId });
      res.send(html);
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
    }, workerHeaders.getCookieStore());
    if (promoInfo) {
      res.setHeader('Set-Cookie', workerHeaders.responseCookies);
      res.redirect(`${route}/${appId}/redeem`);
    } else {
      const html = Mustache.render(nopromoStache, { appId });
      res.send(html);
    }
  });

  app.get(`${route}/:app_id/redeem`, async (req: any, res: any) => {
    const app = req.params.app_id;
    const workerHeaders = new WorkerHeaders(req.headers);
    const promoInfo = await findPromoForUid({
      sheetId: spreadsheetId,
      sheetName: app,
      app,
      secret: SECRET,
    }, workerHeaders.getCookieStore());
    if (promoInfo) {
      const instructions = linkifyHtml(promoInfo.Instructions, {
        target: '_blank',
        defaultProtocol: 'https',
      });
      res.setHeader('Set-Cookie', workerHeaders.responseCookies);
      const html = Mustache.render(redeemStache, { promoInfo, instructions });
      res.send(html);
    } else {
      res.redirect(`${route}/${app}`);
    }
  });
}

export { retrievePromoData, redeemNextPromo, findPromoForUid, WorkerHeaders };
