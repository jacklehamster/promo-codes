import { Application, urlencoded } from "express";
import { config } from "dotenv";
import path from "path";
import { redeemNextPromo, retrievePromoData } from "./promo/redeemNextPromo";
import session from "express-session";
import { first, last } from "random-name";
import { findPromoForUid } from "./promo/retrievePromo";
import { RedisStore } from "connect-redis";
import { createClient, RedisClientType } from "redis";
import linkifyHtml from 'linkify-html';

declare module "express-session" {
  interface SessionData {
    token?: string;
    user?: string;
    uid?: string;
  }
}

config();

const spreadsheetId = process.env.SPREADSHEET_ID ?? "1VwYU7nTSlwhi2iBSFvYBnuhxPUJdIYwE9qbKuVwDk04";

const SECRET = process.env.SECRET_WORD ?? "";

export async function attachPromoCodes(app: Application, route: string = "/promo") {
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

  //  Use redis to store session, to persist longer
  let redisClient: RedisClientType | undefined;
  if (process.env.REDIS_HOST && process.env.REDIS_USER && process.env.REDIS_PASSWORD) {
    const REDIS_URL = `rediss://${process.env.REDIS_HOST ?? "oregon-redis.render.com"}:${process.env.REDIS_PORT ?? 6379}`;

    redisClient = createClient({
      url: REDIS_URL,
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: (retries) => {
          console.log(`Redis reconnect attempt #${retries}`);
          if (retries > 10) return new Error("Max retries reached"); // Stop after 10 attempts
          return Math.min(retries * 100, 2000); // Exponential backoff, max 2s delay
        },
      },
    });
    redisClient.on("error", (err) => {
      console.error("Redis error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });

    redisClient.on("reconnecting", () => {
      console.log("Reconnecting to Redis...");
    });
    await redisClient.connect();
    console.log("Redis store available.");
  }

  app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: PROD },
  }))

  app.get(`${route}/:app_id`, async (req, res) => {
    const appId = req.params.app_id;

    const token = crypto.randomUUID();
    req.session.token = token;
    req.session.user = req.session.user ?? (req.session.user = `${first()}${last()}`.toLowerCase());
    req.session.uid = req.session.uid ?? crypto.randomUUID();

    const promoInfo = await retrievePromoData(spreadsheetId, {
      sheetName: appId,
      app: appId,
    });

    if (promoInfo) {
      res.render("promo", { promoInfo, route, token, source: req.query.src ?? "none" });
    } else {
      res.render("nopromo", { appId });
    }
  });

  app.get(`${route}/:app_id/redeem`, async (req, res) => {
    const uid = req.query.uid?.toString();
    const app = req.query.app?.toString() ?? "";
    if (uid !== req.session.uid) {
      res.status(403).send("Invalid session");
    }
    const promoInfo = await findPromoForUid({
      sheetId: spreadsheetId,
      sheetName: app,
      app,
      uid,
    });
    if (promoInfo) {
      const instructions = linkifyHtml(promoInfo.Instructions, {
        target: '_blank',
        defaultProtocol: 'https',
      });
      res.render("redeem", { promoInfo, instructions });
    } else {
      res.status(403).send("No token available")
    }
  });

  app.post(`${route}/:app_id/redeem`, async (req, res) => {
    const appId = req.params.app_id;
    const token = req.session.token;
    const formToken = req.body.token;
    const src = req.body.src;
    const user = req.session.user ?? (req.session.user = `${first()}${last()}`.toLowerCase());
    req.session.uid = req.session.uid ?? crypto.randomUUID();

    if (token !== formToken) {
      res.status(403).send("Invalid token");
      return;
    }

    const promoInfo = await redeemNextPromo(spreadsheetId, {
      sheetName: appId,
      app: appId,
      User: user,
      Source: src,
      uid: req.session.uid,
    });
    if (promoInfo) {
      res.redirect(`${route}/${appId}/redeem?uid=${req.session.uid}&app=${appId}`);
    } else {
      res.render("nopromo", { appId });
    }
  });
}
