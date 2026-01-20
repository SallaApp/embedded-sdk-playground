import { VERIFY_FUNCTION_URL, getAppId } from "./constants.js";
import logger from "./logger.js";

/**
 * Verify token via Netlify serverless function
 */
export async function verifyToken(token) {
  try {
    const response = await fetch(VERIFY_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        appId: getAppId(),
        iss: "merchant-dashboard",
        subject: "embedded-page",
        // env: "prod",
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    logger.error("Token verification error:", error);
    return { success: false, error: error.message };
  }
}
