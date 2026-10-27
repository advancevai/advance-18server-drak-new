export const PG_URL = "https://advance-admin.lovable.app";
export const PG_KEY = "pgk_live_qMS4Y8HdnyYvayl0CNPgu63dabpdipWH";

export interface PassGateVerifyResult {
  valid: boolean;
  token?: string;
  reason?: 'rate_limited' | 'ip_blocked' | 'origin_not_allowed' | 'invalid_api_key' | 'wrong_password' | string;
}

export interface PassGateSessionResult {
  valid: boolean;
}

export async function callPassGate<T>(path: string, body: Record<string, any>): Promise<T> {
  const response = await fetch(`${PG_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": PG_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok && response.status !== 400 && response.status !== 401 && response.status !== 403 && response.status !== 429) {
    throw new Error(`PassGate HTTP error: ${response.status}`);
  }

  return response.json();
}

export async function verifyPassGatePassword(password: string): Promise<PassGateVerifyResult> {
  try {
    return await callPassGate<PassGateVerifyResult>("/api/public/v1/verify", { password });
  } catch (err) {
    return { valid: false, reason: "network_error" };
  }
}

export async function verifyPassGateSession(token: string): Promise<boolean> {
  try {
    const res = await callPassGate<PassGateSessionResult>("/api/public/v1/session", { token });
    return !!res.valid;
  } catch {
    return false;
  }
}

export function getPassGateMessage(reason?: string, englishMode: boolean = false): string {
  switch (reason) {
    case "rate_limited":
      return englishMode ? "Too many attempts. Try later." : "অনেকবার চেষ্টা করা হয়েছে। পরে চেষ্টা করুন।";
    case "ip_blocked":
      return englishMode ? "Access from your network is blocked." : "আপনার নেটওয়ার্ক থেকে অ্যাক্সেস ব্লক করা হয়েছে।";
    case "origin_not_allowed":
      return englishMode ? "This site is not allowed for this key." : "এই সাইটের জন্য কি অনুমতিপ্রাপ্ত নয়।";
    case "invalid_api_key":
      return englishMode ? "API key is wrong or revoked." : "API key সঠিক নয় বা বাতিল করা হয়েছে।";
    case "network_error":
      return englishMode
        ? "Cannot reach the PassGate server. Is the app published?"
        : "PassGate সার্ভারে সংযোগ করা যাচ্ছে না।";
    default:
      return englishMode ? "Wrong password" : "ভুল পাসওয়ার্ড";
  }
}
