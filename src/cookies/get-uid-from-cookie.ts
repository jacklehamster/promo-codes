import { verifyToken, verifyUid } from "../security/security";
import { CookieStore } from "./CookieStore";

export async function validateUIDFromCookie(cookies: CookieStore, sheetId: string, app: string, secret: string) {
  const signedUID = cookies.getCookie("signedUID");
  const user = cookies.getCookie("user");
  const token = cookies.getCookie("token");
  const payload = await verifyToken(token, secret ?? "");

  if (!payload || payload.app !== app || payload.sheetId !== sheetId || payload.user !== user || payload.signedUID !== signedUID) {
    return {};
  }
  const uid = await verifyUid(signedUID ?? "", secret ?? "") ?? "";
  if (!uid.length) {
    return {};
  }
  return { uid, user };
}
