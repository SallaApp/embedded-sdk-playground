// Token verification is now handled by Netlify serverless function
export const VERIFY_FUNCTION_URL = "/.netlify/functions/verify-token";

// App ID - can be overridden via URL parameter ?appId=XXX
export function getAppId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("app_id");
}
