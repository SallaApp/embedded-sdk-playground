/**
 * Serverless Function - Token Verification
 *
 * This function handles token verification by proxying the request
 * to the Salla exchange authority service.
 */

// Environment-based API URLs
const VERIFY_API_URLS = {
  dev: "https://exchange-authority-service-dev-59.merchants.workers.dev/exchange-authority/v1/verify",
  prod: "https://api.salla.dev/exchange-authority/v1/verify",
};

exports.handler = async (event, _context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || "{}");
    const { token, iss, subject, appId } = body;

    // Validate required fields
    const jsonHeaders = { "Content-Type": "application/json" };

    if (!token) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ success: false, error: "Token is required" }),
      };
    }

    // Validate app ID
    if (!appId) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ success: false, error: "App ID is required" }),
      };
    }

    // Determine environment (default to 'dev' when ENV is not set, e.g. local netlify dev)
    const environment = process.env.ENV || "dev";

    // Get API URL based on environment
    const apiUrl = VERIFY_API_URLS[environment];
    if (!apiUrl) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: `Invalid environment: ${environment}. Must be 'dev' or 'prod'`,
        }),
      };
    }

    // Debug log request details
    console.log("Verifying token with Salla API", {
      apiUrl: apiUrl,
      appId,
      token: token ? "[REDACTED]" : undefined,
      iss: iss || "merchant-dashboard",
      subject: subject || "embedded-page",
      env: environment,
    });

    // Make request to Salla API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "s-source": appId, // APP ID (dynamic)
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        iss: iss || "merchant-dashboard",
        subject: subject || "embedded-page",
        env: environment,
      }),
    });

    // Debug log response status
    console.log("Salla API response status:", response.status);

    const result = await response.json();

    // Return the result with appropriate status code
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow CORS
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
    };
  }
};
