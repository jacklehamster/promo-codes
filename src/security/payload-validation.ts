import { verifyToken, verifyUid } from "./security";

interface Payload {
  signedUID?: string;
  uid?: string;
  token?: string;
  secret?: string;
}

export function validatePayload(payload: Payload) {
  if (!verifyToken(payload.token, payload.secret)) {
    return null;
  }
  const uid = verifyUid(payload.signedUID, payload.secret);
  if (!uid) {
    return null;
  }
  delete payload.signedUID;
  delete payload.token;
  delete payload.secret;
  return {
    ...payload,
    uid,
  }
}
