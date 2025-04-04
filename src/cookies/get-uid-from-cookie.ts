import { verifyToken, verifyUid } from "../security/security";
import { CookieStore } from "./CookieStore";

export async function validateUIDFromCookie(cookies: CookieStore, sheetId: string, app: string, secret: string) {
  const signedUID = cookies.getCookie(`${app}-signedUID`);
  const token = cookies.getCookie(`${app}-token`);
  const payload = await verifyToken(token, secret ?? "");

  if (!payload || payload.app !== app || payload.sheetId !== sheetId || payload.signedUID !== signedUID) {
    return {};
  }
  const uid = await verifyUid(signedUID ?? "", secret ?? "") ?? "";
  if (!uid.length) {
    return {};
  }
  return { uid };
}
