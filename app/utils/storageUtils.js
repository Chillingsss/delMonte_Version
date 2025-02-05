import CryptoJS from "crypto-js";

const BASE_SECRET_KEY =
  process.env.NEXT_PUBLIC_SECRET_KEY || "delMontedelMonte";

// Check if a session key already exists in localStorage
let SESSION_KEY = localStorage.getItem("SESSION_KEY");

if (!SESSION_KEY) {
  // Generate a new session key if it doesn't exist
  SESSION_KEY = CryptoJS.lib.WordArray.random(16).toString();
  localStorage.setItem("SESSION_KEY", SESSION_KEY);
}

// const BROWSER_KEY = CryptoJS.SHA256(navigator.userAgent).toString(); // Unique per browser

const getBrowserFingerprint = () => {
  const userAgent = navigator.userAgent;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const hardwareConcurrency = navigator.hardwareConcurrency || "unknown";
  const deviceMemory = navigator.deviceMemory || "unknown";

  return CryptoJS.SHA256(
    userAgent +
      screenResolution +
      timeZone +
      language +
      hardwareConcurrency +
      deviceMemory
  ).toString();
};

const BROWSER_KEY = getBrowserFingerprint();

// Generate dynamic secret key (changes per browser and per session)
const getDynamicKey = () =>
  CryptoJS.SHA256(BASE_SECRET_KEY + BROWSER_KEY + SESSION_KEY).toString();

// /**
//  * Encrypts data using AES encryption.
//  * @param {Object|string} data - The data to encrypt.
//  * @returns {string} - Encrypted data.
//  */
// export const encryptData = (data) => {
//   const stringData = typeof data === "string" ? data : JSON.stringify(data);
//   return CryptoJS.AES.encrypt(stringData, getDynamicKey()).toString();
// };

// export const decryptData = (encryptedData) => {
//   try {
//     // Decrypt the data
//     const bytes = CryptoJS.AES.decrypt(encryptedData, getDynamicKey());
//     const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

//     // Check if the decrypted data is valid JSON
//     if (isValidJSON(decryptedData)) {
//       return JSON.parse(decryptedData); // Only parse if it's JSON
//     }
//     return decryptedData; // Return as-is if it's not JSON
//   } catch (error) {
//     console.error("Decryption failed:", error);
//     return null;
//   }
// };

const getTimeBasedToken = () => {
  const now = new Date();
  const timeToken = Math.floor(now.getTime() / (1000 * 60)); // Token valid for 1 minute
  return timeToken;
};

const encryptData = (data) => {
  const stringData = typeof data === "string" ? data : JSON.stringify(data);
  const timeToken = getTimeBasedToken();
  const dataWithToken = `${stringData}|${timeToken}`;
  return CryptoJS.AES.encrypt(dataWithToken, getDynamicKey()).toString();
};

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, getDynamicKey());
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    const [data, timeToken] = decryptedData.split("|");
    const currentTimeToken = getTimeBasedToken();

    if (Math.abs(currentTimeToken - timeToken) > 1) {
      // Allow 1-minute window
      console.error("Token expired or invalid");
      return null;
    }

    if (isValidJSON(data)) {
      return JSON.parse(data);
    }
    return data;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

// Helper function to check if a string is valid JSON
const isValidJSON = (string) => {
  try {
    JSON.parse(string);
    return true;
  } catch (error) {
    return false;
  }
};

export const parseJwt = (token) => {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1]; // Get payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT parsing failed:", error);
    return null;
  }
};

/**
 * Stores encrypted data in cookies.
 * @param {string} key - Cookie name.
 * @param {Object|string} value - Data to store.
 * @param {number} expiryInSeconds - Expiry time in seconds.
 */
export const storeDataInCookie = (key, value, expiryInSeconds) => {
  const encryptedValue = encryptData(value);
  const expires = new Date(Date.now() + expiryInSeconds * 1000).toUTCString();
  document.cookie = `${key}=${encryptedValue}; expires=${expires}; path=/; Secure; SameSite=Strict`;
};

/**
 * Retrieves and decrypts data from cookies.
 * @param {string} key - Cookie name.
 * @returns {Object|string|null} - Decrypted data or null if not found.
 */
export const getDataFromCookie = (key) => {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [cookieKey, cookieValue] = cookie.split("=");
    if (cookieKey === key) {
      return decryptData(cookieValue);
    }
  }
  return null;
};

/**
 * Stores encrypted data in sessionStorage and syncs it to localStorage.
 * @param {string} key - Storage key.
 * @param {Object|string} value - Data to store.
 */
export const storeDataInSession = (key, value) => {
  const encryptedValue = encryptData(value);
  sessionStorage.setItem(key, encryptedValue);
  localStorage.setItem(`sessionSync_${key}`, encryptedValue); // Sync to local storage
};

/**
 * Retrieves and decrypts data from sessionStorage.
 * @param {string} key - Storage key.
 * @returns {Object|string|null} - Decrypted data or null if not found.
 */
export const getDataFromSession = (key) => {
  const encryptedValue = sessionStorage.getItem(key);
  return encryptedValue ? decryptData(encryptedValue) : null;
};

// Function to sync session storage data to local storage
const syncSessionStorageToLocalStorage = (key, value) => {
  localStorage.setItem(`sessionSync_${key}`, value);
};

// Function to update session storage data from local storage
const updateSessionStorageFromLocalStorage = (key, value) => {
  sessionStorage.setItem(key, value);
};

// Listen for storage events to sync session data across tabs
window.addEventListener("storage", (event) => {
  if (event.key && event.key.startsWith("sessionSync_")) {
    const sessionKey = event.key.replace("sessionSync_", "");
    updateSessionStorageFromLocalStorage(sessionKey, event.newValue);
  }
});

// Initialize session storage from local storage when the page loads
const initializeSessionStorage = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sessionSync_")) {
      const sessionKey = key.replace("sessionSync_", "");
      const value = localStorage.getItem(key);
      sessionStorage.setItem(sessionKey, value);
    }
  });
};

// Call the initialization function when the script loads
initializeSessionStorage();

/**
 * Stores encrypted data in localStorage.
 * @param {string} key - Storage key.
 * @param {Object|string} value - Data to store.
 */
export const storeDataInLocal = (key, value) => {
  const encryptedValue = encryptData(value);
  localStorage.setItem(key, encryptedValue);
};

/**
 * Retrieves and decrypts data from localStorage.
 * @param {string} key - Storage key.
 * @returns {Object|string|null} - Decrypted data or null if not found.
 */
export const getDataFromLocal = (key) => {
  const encryptedValue = localStorage.getItem(key);
  return encryptedValue ? decryptData(encryptedValue) : null;
};

/**
 * Removes a specific cookie.
 * @param {string} key - Cookie name.
 */
export const removeCookie = (key) => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Removes all cookies.
 */
export const clearAllCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const key = cookie.split("=")[0].trim();
    removeCookie(key);
  });
};

/**
 * Removes a specific item from sessionStorage and local storage sync.
 * @param {string} key - Storage key.
 */
export const removeSessionData = (key) => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(`sessionSync_${key}`); // Also remove from local storage
};

/**
 * Clears all sessionStorage data and local storage sync data.
 */
export const clearAllSessionData = () => {
  sessionStorage.clear();
  // Clear all session sync data from local storage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sessionSync_")) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Removes a specific item from localStorage.
 * @param {string} key - Storage key.
 */
export const removeLocalData = (key) => {
  localStorage.removeItem(key);
};

/**
 * Clears all localStorage data.
 */
export const clearAllLocalData = () => {
  localStorage.clear();
};

// New code for clearing data after 12 minutes of inactivity
let inactivityTimer;

const clearAllData = () => {
  clearAllCookies();
  clearAllLocalData();
  clearAllSessionData();
  window.location.href = "/";
};

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    clearAllData();
  }, 12 * 60 * 1000); // 12 minutes in milliseconds
};

// Events to detect user activity
["mousemove", "keydown", "click", "scroll"].forEach((event) => {
  window.addEventListener(event, resetInactivityTimer);
});

// Initialize the timer
resetInactivityTimer();
