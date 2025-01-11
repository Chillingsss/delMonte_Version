import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

const secretKey = "delMontedelMonte";

function padString(str) {
  return str.padEnd(16, "-");
}

export function encryptData(data) {
  if (data === null || data === undefined) {
    console.error("Invalid data provided for encryption.");
    return null;
  }

  const combinedData = {
    data: typeof data === "string" ? padString(data) : data,
  };

  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(combinedData),
      secretKey
    ).toString();
    const hmac = CryptoJS.HmacSHA256(encryptedData, secretKey).toString();
    return `${encryptedData}:${hmac}`;
  } catch (error) {
    console.error("Error during encryption:", error);
    return null;
  }
}

export function decryptData(encryptedDataWithHmac) {
  if (!encryptedDataWithHmac || typeof encryptedDataWithHmac !== "string") {
    console.error("Invalid data provided for decryption.");
    return null;
  }

  try {
    const [retrievedEncryptedData, retrievedHmac] =
      encryptedDataWithHmac.split(":");
    const validHmac = CryptoJS.HmacSHA256(
      retrievedEncryptedData,
      secretKey
    ).toString();

    if (retrievedHmac !== validHmac) {
      console.error("Data integrity check failed!");
      return null;
    }

    const decryptedData = CryptoJS.AES.decrypt(
      retrievedEncryptedData,
      secretKey
    ).toString(CryptoJS.enc.Utf8);

    const { data } = JSON.parse(decryptedData);

    if (typeof data === "string") {
      return data.replace(/-+$/, "");
    }

    return data;
  } catch (error) {
    console.error("Error during decryption:", error);
    handleSessionTampering();
    return null;
  }
}

let broadcastChannel;
if (typeof window !== "undefined") {
  broadcastChannel = new BroadcastChannel("session_sync");

  broadcastChannel.onmessage = (event) => {
    const { key, value } = event.data;
    if (key && value) {
      window.sessionStorage.setItem(key, value);
    }
  };

  window.addEventListener("load", () => {
    initializeSessionFromCookies();
  });
}

function initializeSessionFromCookies() {
  try {
    const authCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_data="));

    if (authCookie) {
      const sessionData = JSON.parse(
        decodeURIComponent(authCookie.split("=")[1])
      );
      Object.entries(sessionData).forEach(([key, value]) => {
        if (key && value) {
          window.sessionStorage.setItem(key, value);
        }
      });
    }
  } catch (error) {
    console.error("Error initializing session:", error);
  }
}

export function storeData(key, data) {
  if (data === null || data === undefined) {
    console.warn("Invalid data provided");
    handleSessionTampering();
  }

  try {
    const encryptedData = encryptData(data);
    if (!encryptedData) return;

    window.sessionStorage.setItem(key, encryptedData);

    const sessionData = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      sessionData[k] = sessionStorage.getItem(k);
    }

    document.cookie = `auth_data=${encodeURIComponent(
      JSON.stringify(sessionData)
    )};path=/;secure;samesite=Strict`;

    if (broadcastChannel) {
      broadcastChannel.postMessage({ key, value: encryptedData });
    }
  } catch (error) {
    console.error("Error storing data:", error);
  }
}

export function retrieveData(key) {
  try {
    let encryptedDataWithHmac = window.sessionStorage.getItem(key);

    if (!encryptedDataWithHmac) {
      const authCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_data="));

      if (authCookie) {
        const sessionData = JSON.parse(
          decodeURIComponent(authCookie.split("=")[1])
        );
        encryptedDataWithHmac = sessionData[key];

        if (encryptedDataWithHmac) {
          window.sessionStorage.setItem(key, encryptedDataWithHmac);
        }
      }
    }

    if (encryptedDataWithHmac) {
      const decryptedData = decryptData(encryptedDataWithHmac);
      if (decryptedData === null) {
        console.warn(`Failed to decrypt data for key: ${key}`);
        handleSessionTampering();
      }
      return decryptedData;
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
  return null;
}

export function removeData(key) {
  if (!key) {
    console.error("Invalid key provided for removal");
    handleSessionTampering();
    return;
  }

  try {
    // Store initial state for verification
    const initialValue = window.sessionStorage.getItem(key);

    window.sessionStorage.removeItem(key);

    // Verify removal from sessionStorage
    const afterValue = window.sessionStorage.getItem(key);
    if (initialValue && afterValue) {
      console.error("Failed to remove data from sessionStorage");
      handleSessionTampering();
      return;
    }

    const authCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_data="));

    if (authCookie) {
      try {
        const sessionData = JSON.parse(
          decodeURIComponent(authCookie.split("=")[1])
        );
        delete sessionData[key];

        // Set updated cookie with strict security parameters
        document.cookie = `auth_data=${encodeURIComponent(
          JSON.stringify(sessionData)
        )};path=/;secure;samesite=Strict`;

        // Verify cookie update
        const updatedCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_data="));

        if (!updatedCookie) {
          console.error("Failed to update auth_data cookie");
          handleSessionTampering();
          return;
        }
      } catch (parseError) {
        console.error("Error parsing auth_data cookie:", parseError);
        handleSessionTampering();
        return;
      }
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ key, value: null });
    }
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    handleSessionTampering();
  }
}

export function storeDataInLocalStorage(key, data) {
  if (data === null || data === undefined) {
    console.warn("Invalid data provided");
    handleSessionTampering();
    return;
  }

  try {
    const encryptedData = encryptData(data);
    if (!encryptedData) return;

    window.localStorage.setItem(key, encryptedData);

    // Update sessionData to reflect the current state of localStorage
    const sessionData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      sessionData[k] = localStorage.getItem(k);
    }

    // Store updated session data in cookies
    document.cookie = `auth_data=${encodeURIComponent(
      JSON.stringify(sessionData)
    )};path=/;secure;samesite=Strict`;

    if (broadcastChannel) {
      broadcastChannel.postMessage({ key, value: encryptedData });
    }
  } catch (error) {
    console.error("Error storing data:", error);
  }
}

export function retrieveDataInLocalStorage(key) {
  try {
    let encryptedDataWithHmac = window.localStorage.getItem(key);

    if (!encryptedDataWithHmac) {
      const authCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_data="));

      if (authCookie) {
        const sessionData = JSON.parse(
          decodeURIComponent(authCookie.split("=")[1])
        );
        encryptedDataWithHmac = sessionData[key];

        if (encryptedDataWithHmac) {
          window.localStorage.setItem(key, encryptedDataWithHmac);
        }
      }
    }

    if (encryptedDataWithHmac) {
      const decryptedData = decryptData(encryptedDataWithHmac);
      if (decryptedData === null) {
        console.warn(`Failed to decrypt data for key: ${key}`);
        handleSessionTampering();
      }
      return decryptedData;
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
  return null;
}

export function removeDataInLocalStorage(key, shouldRemove = true) {
  if (!key) {
    console.error("Invalid key provided for removal");
    handleSessionTampering();
    return;
  }

  if (!shouldRemove) {
    console.warn(
      "Data removal is disabled. Data will not be removed from localStorage."
    );
    return;
  }

  try {
    // Store initial state for verification
    const initialValue = window.localStorage.getItem(key);

    window.localStorage.removeItem(key);

    // Verify removal from localStorage
    const afterValue = window.localStorage.getItem(key);
    if (initialValue && afterValue !== null) {
      console.error("Failed to remove data from localStorage");
      handleSessionTampering();
      return;
    }

    const authCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_data="));

    if (authCookie) {
      try {
        const sessionData = JSON.parse(
          decodeURIComponent(authCookie.split("=")[1])
        );
        delete sessionData[key];

        // Set updated cookie with strict security parameters
        document.cookie = `auth_data=${encodeURIComponent(
          JSON.stringify(sessionData)
        )};path=/;secure;samesite=Strict`;

        // Verify cookie update
        const updatedCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_data="));

        if (!updatedCookie) {
          console.error("Failed to update auth_data cookie");
          handleSessionTampering();
          return;
        }
      } catch (parseError) {
        console.error("Error parsing auth_data cookie:", parseError);
        handleSessionTampering();
        return;
      }
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ key, value: null });
    }
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    handleSessionTampering();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("unload", () => {
    if (broadcastChannel) {
      broadcastChannel.close();
    }
  });
}

export function storeDataInCookie(key, data, maxAgeSeconds = 3600) {
  try {
    // Convert data to string if it's not already
    const dataString = typeof data === "string" ? data : JSON.stringify(data);

    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(dataString, secretKey).toString();

    // Create cookie with domain and secure flags
    const cookieValue = `${key}=${encrypted};max-age=${maxAgeSeconds};path=/;secure;samesite=Strict`;
    console.log("Setting encrypted cookie");
    document.cookie = cookieValue;

    // Verify cookie was set
    const verificationValue = retrieveDataFromCookie(key);
    console.log("Cookie verification:", { key, hasValue: !!verificationValue });

    if (!verificationValue) {
      handleSessionTampering();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error storing cookie:", error);
    handleSessionTampering();
    return false;
  }
}

export function retrieveDataFromCookie(key) {
  try {
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

    const targetCookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));
    if (!targetCookie) {
      return null;
    }

    const encryptedValue = targetCookie.split("=")[1];
    if (!encryptedValue) {
      handleSessionTampering();
      return null;
    }

    try {
      // Decrypt the cookie value
      const decrypted = CryptoJS.AES.decrypt(encryptedValue, secretKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedString) {
        handleSessionTampering();
        return null;
      }

      try {
        // Attempt to parse as JSON if possible
        return JSON.parse(decryptedString);
      } catch {
        // Return as is if not JSON
        return decryptedString;
      }
    } catch (decryptError) {
      console.error("Error decrypting cookie:", decryptError);
      handleSessionTampering();
      return null;
    }
  } catch (error) {
    console.error("Error retrieving cookie:", error);
    handleSessionTampering();
    return null;
  }
}

export function removeDataFromCookie(key) {
  try {
    // Verify the cookie exists before removal
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
    const targetCookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));

    document.cookie = `${key}=;max-age=0;path=/;secure;samesite=Strict`;

    // Verify the cookie was actually removed
    const cookiesAfter = document.cookie
      .split(";")
      .map((cookie) => cookie.trim());
    const cookieStillExists = cookiesAfter.some((cookie) =>
      cookie.startsWith(`${key}=`)
    );

    if (cookieStillExists) {
      console.error("Failed to remove cookie:", key);
      handleSessionTampering();
      return false;
    }

    console.log("Removed cookie:", key);
    return true;
  } catch (error) {
    console.error("Error removing cookie:", error);
    handleSessionTampering();
    return false;
  }
}

function handleSessionTampering() {
  console.warn("Invalid session data detected");

  // Clear all session storage
  window.sessionStorage.clear();

  // Clear all cookies
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;max-age=0;path=/;secure;samesite=Strict`;
  });

  // Broadcast the clear event to other tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage({ action: "clearAll" });
  }

  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

export function setupInactivityMonitoring() {
  if (typeof window === "undefined") return;

  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
  let inactivityTimer;

  function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
      console.warn("User inactive for 10 minutes, logging out...");
      handleSessionTampering();
    }, INACTIVITY_TIMEOUT);
  }

  // Monitor user activity
  const events = [
    "mousemove",
    "keydown",
    "mousedown",
    "touchstart",
    "scroll",
    "click",
  ];

  events.forEach((event) => {
    window.addEventListener(event, resetInactivityTimer);
  });

  // Initial setup
  resetInactivityTimer();

  // Cleanup function
  return () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    events.forEach((event) => {
      window.removeEventListener(event, resetInactivityTimer);
    });
  };
}

// // Call this in your app's initialization
// if (typeof window !== "undefined") {
//   setupActivityListeners();
// }
