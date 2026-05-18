// src/utils/restrictions.ts
export const RESTRICTED_EMAILS = new Set([
  "info@alphatrust.ai"  
]);

export const isRestrictedUser = (): boolean => {
  try {
    const raw = localStorage.getItem("user");
    const email = (raw ? JSON.parse(raw)?.email : "").toLowerCase();
    return RESTRICTED_EMAILS.has(email);
  } catch {
    return false;
  }
};
