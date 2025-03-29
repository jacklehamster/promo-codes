import { redeemNextPromo } from "./promo/redeemNextPromo";
import { retrievePromoData } from "./promo/retrievePromo";
import { findPromoForUid } from "./promo/retrievePromo";

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
import path from "path";
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

  const PROD = app.get('env') === 'production';
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../views")); // Set the views directory

  if (PROD) {
    app.set('trust proxy', 1) // trust first proxy
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
      res.render("promo", { promoInfo, route, source: req.query.src ?? "none" });
    } else {
      res.render("nopromo", { appId });
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
      res.render("nopromo", { appId });
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
      res.render("redeem", { promoInfo, instructions });
    } else {
      res.redirect(`${route}/${app}`);
    }
  });
}

export { retrievePromoData, redeemNextPromo, findPromoForUid }
