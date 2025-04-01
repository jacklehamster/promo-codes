import { Row } from "@dobuki/google-sheet-db";

export interface Promo extends Row {
  Code: string;
  Name: string;
  Redeemed: string;
  App: string;
  User: string;
  Icon: string;
  Source: string;
  UID: string;
  Instructions: string;
  Expiration: string;
  Store: string;
  ButtonLink: string;
  ButtonImage: string;
  GTAG: string;
  storeLink?: string;
  Hidden: boolean | string;
}
