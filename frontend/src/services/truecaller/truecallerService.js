const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://frost-7sn1.onrender.com";

/**
 * Start a new Truecaller verification request.
 */
export async function startTruecallerVerification() {
  const response = await fetch(
    `${API_BASE}/api/truecaller/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from FROST server."
    );
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Unable to start Truecaller verification."
    );
  }

  return result.data;
}


/**
 * Build the Truecaller Mobile Web deep link.
 */
export function buildTruecallerDeepLink({
  requestNonce,
  partnerKey,
  partnerName,
}) {
  if (!requestNonce) {
    throw new Error(
      "Truecaller request nonce is missing."
    );
  }

  if (!partnerKey) {
    throw new Error(
      "Truecaller app key is missing."
    );
  }

  const params = new URLSearchParams({
    type: "btmsheet",

    requestNonce,

    partnerKey,

    partnerName:
      partnerName || "FROST",

    lang: "en",

    loginPrefix: "continue",

    loginSuffix: "loginsignup",

    ctaPrefix: "continuewith",

    skipOption: "useanothermethod",

    btnShape: "round",

    ttl: "15000",
  });

  return `truecallersdk://truesdk/web_verify?${params.toString()}`;
}


/**
 * Check the status of an existing verification request.
 */
export async function getTruecallerVerificationStatus(
  requestNonce
) {
  const response = await fetch(
    `${API_BASE}/api/truecaller/status/${encodeURIComponent(
      requestNonce
    )}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid verification status response."
    );
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Unable to check Truecaller verification."
    );
  }

  return result.data;
}


/**
 * Determine whether the current device is Android.
 *
 * Truecaller's Mobile Web SDK currently supports
 * Android browsers.
 */
export function isAndroidDevice() {
  return /Android/i.test(
    navigator.userAgent
  );
}


/**
 * Invoke the Truecaller deep link.
 */
export function invokeTruecaller(
  deepLink
) {
  window.location.href = deepLink;
}
