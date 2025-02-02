// import CryptoJS from "crypto-js";
// import { v4 as uuidv4 } from "uuid";

// const secretKey = "delMontedelMonte";

// function padString(str) {
//   return str.padEnd(16, "-");
// }

// export function encryptData(data) {
//   if (data === null || data === undefined) {
//     console.error("Invalid data provided for encryption.");
//     return null;
//   }

//   const combinedData = {
//     data: typeof data === "string" ? padString(data) : data,
//   };

//   try {
//     const encryptedData = CryptoJS.AES.encrypt(
//       JSON.stringify(combinedData),
//       secretKey
//     ).toString();
//     const hmac = CryptoJS.HmacSHA256(encryptedData, secretKey).toString();
//     return `${encryptedData}:${hmac}`;
//   } catch (error) {
//     console.error("Error during encryption:", error);
//     return null;
//   }
// }

// export function decryptData(encryptedDataWithHmac) {
//   if (!encryptedDataWithHmac || typeof encryptedDataWithHmac !== "string") {
//     console.error("Invalid data provided for decryption.");
//     return null;
//   }

//   try {
//     const [retrievedEncryptedData, retrievedHmac] =
//       encryptedDataWithHmac.split(":");
//     const validHmac = CryptoJS.HmacSHA256(
//       retrievedEncryptedData,
//       secretKey
//     ).toString();

//     if (retrievedHmac !== validHmac) {
//       console.error("Data integrity check failed!");
//       return null;
//     }

//     const decryptedData = CryptoJS.AES.decrypt(
//       retrievedEncryptedData,
//       secretKey
//     ).toString(CryptoJS.enc.Utf8);

//     const { data } = JSON.parse(decryptedData);

//     if (typeof data === "string") {
//       return data.replace(/-+$/, "");
//     }

//     return data;
//   } catch (error) {
//     console.error("Error during decryption:", error);
//     handleSessionTampering();
//     return null;
//   }
// }

// let broadcastChannel;
// if (typeof window !== "undefined") {
//   broadcastChannel = new BroadcastChannel("session_sync");

//   broadcastChannel.onmessage = (event) => {
//     const { key, value } = event.data;
//     if (key && value) {
//       window.sessionStorage.setItem(key, value);
//     }
//   };

//   window.addEventListener("load", () => {
//     initializeSessionFromCookies();
//   });
// }

// function initializeSessionFromCookies() {
//   try {
//     const authCookie = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("auth_data="));

//     if (authCookie) {
//       const sessionData = JSON.parse(
//         decodeURIComponent(authCookie.split("=")[1])
//       );
//       Object.entries(sessionData).forEach(([key, value]) => {
//         if (key && value) {
//           window.sessionStorage.setItem(key, value);
//         }
//       });
//     }
//   } catch (error) {
//     console.error("Error initializing session:", error);
//   }
// }

// export function storeDataInSession(key, data) {
//   if (data === null || data === undefined) {
//     console.warn("Invalid data provided");
//     handleSessionTampering();
//   }

//   try {
//     const encryptedData = encryptData(data);
//     if (!encryptedData) return;

//     window.sessionStorage.setItem(key, encryptedData);

//     const sessionData = {};
//     for (let i = 0; i < sessionStorage.length; i++) {
//       const k = sessionStorage.key(i);
//       sessionData[k] = sessionStorage.getItem(k);
//     }

//     document.cookie = `auth_data=${encodeURIComponent(
//       JSON.stringify(sessionData)
//     )};path=/;secure;samesite=None`;

//     if (broadcastChannel) {
//       broadcastChannel.postMessage({ key, value: encryptedData });
//     }
//   } catch (error) {
//     console.error("Error storing data:", error);
//   }
// }

// export function getDataFromSession(key) {
//   try {
//     let encryptedDataWithHmac = window.sessionStorage.getItem(key);

//     if (!encryptedDataWithHmac) {
//       const authCookie = document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("auth_data="));

//       if (authCookie) {
//         const sessionData = JSON.parse(
//           decodeURIComponent(authCookie.split("=")[1])
//         );
//         encryptedDataWithHmac = sessionData[key];

//         if (encryptedDataWithHmac) {
//           window.sessionStorage.setItem(key, encryptedDataWithHmac);
//         }
//       }
//     }

//     if (encryptedDataWithHmac) {
//       const decryptedData = decryptData(encryptedDataWithHmac);
//       if (decryptedData === null) {
//         console.warn(`Failed to decrypt data for key: ${key}`);
//         handleSessionTampering();
//       }
//       return decryptedData;
//     }
//   } catch (error) {
//     console.error("Error retrieving data:", error);
//   }
//   return null;
// }

// export function removeDataFromSession(key) {
//   if (!key) {
//     console.error("Invalid key provided for removal");
//     handleSessionTampering();
//     return;
//   }

//   try {
//     // Store initial state for verification
//     const initialValue = window.sessionStorage.getItem(key);

//     window.sessionStorage.removeItem(key);

//     // Verify removal from sessionStorage
//     const afterValue = window.sessionStorage.getItem(key);
//     if (initialValue && afterValue) {
//       console.error("Failed to remove data from sessionStorage");
//       handleSessionTampering();
//       return;
//     }

//     const authCookie = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("auth_data="));

//     if (authCookie) {
//       try {
//         const sessionData = JSON.parse(
//           decodeURIComponent(authCookie.split("=")[1])
//         );
//         delete sessionData[key];

//         // Set updated cookie with strict security parameters
//         document.cookie = `auth_data=${encodeURIComponent(
//           JSON.stringify(sessionData)
//         )};path=/;secure;samesite=None`;

//         // Verify cookie update
//         const updatedCookie = document.cookie
//           .split("; ")
//           .find((row) => row.startsWith("auth_data="));

//         if (!updatedCookie) {
//           console.error("Failed to update auth_data cookie");
//           handleSessionTampering();
//           return;
//         }
//       } catch (parseError) {
//         console.error("Error parsing auth_data cookie:", parseError);
//         handleSessionTampering();
//         return;
//       }
//     }

//     if (broadcastChannel) {
//       broadcastChannel.postMessage({ key, value: null });
//     }
//   } catch (error) {
//     console.error(`Error removing data for key ${key}:`, error);
//     handleSessionTampering();
//   }
// }

// export function storeDataInLocal(key, data) {
//   if (data === null || data === undefined) {
//     console.warn("Invalid data provided");
//     handleSessionTampering();
//     return;
//   }

//   try {
//     const encryptedData = encryptData(data);
//     if (!encryptedData) return;

//     window.localStorage.setItem(key, encryptedData);

//     // Update sessionData to reflect the current state of localStorage
//     const sessionData = {};
//     for (let i = 0; i < localStorage.length; i++) {
//       const k = localStorage.key(i);
//       sessionData[k] = localStorage.getItem(k);
//     }

//     // Store updated session data in cookies
//     document.cookie = `auth_data=${encodeURIComponent(
//       JSON.stringify(sessionData)
//     )};path=/;secure;samesite=None`;

//     if (broadcastChannel) {
//       broadcastChannel.postMessage({ key, value: encryptedData });
//     }
//   } catch (error) {
//     console.error("Error storing data:", error);
//   }
// }

// export function getDataFromLocal(key) {
//   try {
//     let encryptedDataWithHmac = window.localStorage.getItem(key);

//     if (!encryptedDataWithHmac) {
//       const authCookie = document.cookie
//         .split("; ")
//         .find((row) => row.startsWith("auth_data="));

//       if (authCookie) {
//         const sessionData = JSON.parse(
//           decodeURIComponent(authCookie.split("=")[1])
//         );
//         encryptedDataWithHmac = sessionData[key];

//         if (encryptedDataWithHmac) {
//           window.localStorage.setItem(key, encryptedDataWithHmac);
//         }
//       }
//     }

//     if (encryptedDataWithHmac) {
//       const decryptedData = decryptData(encryptedDataWithHmac);
//       if (decryptedData === null) {
//         console.warn(`Failed to decrypt data for key: ${key}`);
//         handleSessionTampering();
//       }
//       return decryptedData;
//     }
//   } catch (error) {
//     console.error("Error retrieving data:", error);
//   }
//   return null;
// }

// export function removeLocalData(key, shouldRemove = true) {
//   if (!key) {
//     console.error("Invalid key provided for removal");
//     handleSessionTampering();
//     return;
//   }

//   if (!shouldRemove) {
//     console.warn(
//       "Data removal is disabled. Data will not be removed from localStorage."
//     );
//     return;
//   }

//   try {
//     // Store initial state for verification
//     const initialValue = window.localStorage.getItem(key);

//     window.localStorage.removeItem(key);

//     // Verify removal from localStorage
//     const afterValue = window.localStorage.getItem(key);
//     if (initialValue && afterValue !== null) {
//       console.error("Failed to remove data from localStorage");
//       handleSessionTampering();
//       return;
//     }

//     const authCookie = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("auth_data="));

//     if (authCookie) {
//       try {
//         const sessionData = JSON.parse(
//           decodeURIComponent(authCookie.split("=")[1])
//         );
//         delete sessionData[key];

//         // Set updated cookie with strict security parameters
//         document.cookie = `auth_data=${encodeURIComponent(
//           JSON.stringify(sessionData)
//         )};path=/;secure;samesite=None`;

//         // Verify cookie update
//         const updatedCookie = document.cookie
//           .split("; ")
//           .find((row) => row.startsWith("auth_data="));

//         if (!updatedCookie) {
//           console.error("Failed to update auth_data cookie");
//           handleSessionTampering();
//           return;
//         }
//       } catch (parseError) {
//         console.error("Error parsing auth_data cookie:", parseError);
//         handleSessionTampering();
//         return;
//       }
//     }

//     if (broadcastChannel) {
//       broadcastChannel.postMessage({ key, value: null });
//     }
//   } catch (error) {
//     console.error(`Error removing data for key ${key}:`, error);
//     handleSessionTampering();
//   }
// }

// if (typeof window !== "undefined") {
//   window.addEventListener("unload", () => {
//     if (broadcastChannel) {
//       broadcastChannel.close();
//     }
//   });
// }

// export function storeDataInCookie(key, data, maxAgeSeconds = 3600) {
//   try {
//     // Convert data to string if it's not already
//     const dataString = typeof data === "string" ? data : JSON.stringify(data);

//     // Encrypt the data
//     const encrypted = CryptoJS.AES.encrypt(dataString, secretKey).toString();

//     // Create cookie with domain and secure flags
//     const cookieValue = `${key}=${encrypted};max-age=${maxAgeSeconds};path=/;secure;samesite=None`;
//     console.log("Setting encrypted cookie");
//     document.cookie = cookieValue;

//     // Verify cookie was set
//     const verificationValue = getDataFromCookie(key);
//     console.log("Cookie verification:", { key, hasValue: !!verificationValue });

//     if (!verificationValue) {
//       handleSessionTampering();
//       return false;
//     }

//     return true;
//   } catch (error) {
//     console.error("Error storing cookie:", error);
//     handleSessionTampering();
//     return false;
//   }
// }

// export function getDataFromCookie(key) {
//   try {
//     const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

//     const targetCookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));
//     if (!targetCookie) {
//       return null;
//     }

//     const encryptedValue = targetCookie.split("=")[1];
//     if (!encryptedValue) {
//       handleSessionTampering();
//       return null;
//     }

//     try {
//       // Decrypt the cookie value
//       const decrypted = CryptoJS.AES.decrypt(encryptedValue, secretKey);
//       const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

//       if (!decryptedString) {
//         handleSessionTampering();
//         return null;
//       }

//       try {
//         // Attempt to parse as JSON if possible
//         return JSON.parse(decryptedString);
//       } catch {
//         // Return as is if not JSON
//         return decryptedString;
//       }
//     } catch (decryptError) {
//       console.error("Error decrypting cookie:", decryptError);
//       handleSessionTampering();
//       return null;
//     }
//   } catch (error) {
//     console.error("Error retrieving cookie:", error);
//     handleSessionTampering();
//     return null;
//   }
// }

// export function removeCookie(key) {
//   try {
//     // Verify the cookie exists before removal
//     const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
//     const targetCookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));

//     document.cookie = `${key}=;max-age=0;path=/;secure;samesite=None`;

//     // Verify the cookie was actually removed
//     const cookiesAfter = document.cookie
//       .split(";")
//       .map((cookie) => cookie.trim());
//     const cookieStillExists = cookiesAfter.some((cookie) =>
//       cookie.startsWith(`${key}=`)
//     );

//     if (cookieStillExists) {
//       console.error("Failed to remove cookie:", key);
//       handleSessionTampering();
//       return false;
//     }

//     console.log("Removed cookie:", key);
//     return true;
//   } catch (error) {
//     console.error("Error removing cookie:", error);
//     handleSessionTampering();
//     return false;
//   }
// }

// function handleSessionTampering() {
//   console.warn("Invalid session data detected");

//   // Clear all session storage
//   window.sessionStorage.clear();

//   // Clear all cookies
//   document.cookie.split(";").forEach((cookie) => {
//     const eqPos = cookie.indexOf("=");
//     const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
//     document.cookie = `${name}=;max-age=0;path=/;secure;samesite=None`;
//   });

//   // Broadcast the clear event to other tabs
//   if (broadcastChannel) {
//     broadcastChannel.postMessage({ action: "clearAll" });
//   }

//   if (typeof window !== "undefined") {
//     window.location.href = "/";
//   }
// }

// export function setupInactivityMonitoring() {
//   if (typeof window === "undefined") return;

//   const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
//   let inactivityTimer;

//   function resetInactivityTimer() {
//     if (inactivityTimer) clearTimeout(inactivityTimer);

//     inactivityTimer = setTimeout(() => {
//       console.warn("User inactive for 10 minutes, logging out...");
//       handleSessionTampering();
//     }, INACTIVITY_TIMEOUT);
//   }

//   // Monitor user activity
//   const events = [
//     "mousemove",
//     "keydown",
//     "mousedown",
//     "touchstart",
//     "scroll",
//     "click",
//   ];

//   events.forEach((event) => {
//     window.addEventListener(event, resetInactivityTimer);
//   });

//   // Initial setup
//   resetInactivityTimer();

//   // Cleanup function
//   return () => {
//     if (inactivityTimer) clearTimeout(inactivityTimer);
//     events.forEach((event) => {
//       window.removeEventListener(event, resetInactivityTimer);
//     });
//   };
// }

// // Call this in your app's initialization
// if (typeof window !== "undefined") {
//   setupActivityListeners();
// }

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

const BROWSER_KEY = CryptoJS.SHA256(navigator.userAgent).toString(); // Unique per browser

// Generate dynamic secret key (changes per browser and per session)
const getDynamicKey = () =>
  CryptoJS.SHA256(BASE_SECRET_KEY + BROWSER_KEY + SESSION_KEY).toString();

/**
 * Encrypts data using AES encryption.
 * @param {Object|string} data - The data to encrypt.
 * @returns {string} - Encrypted data.
 */
export const encryptData = (data) => {
  const stringData = typeof data === "string" ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(stringData, getDynamicKey()).toString();
};

export const decryptData = (encryptedData) => {
  try {
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, getDynamicKey());
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    // Check if the decrypted data is valid JSON
    if (isValidJSON(decryptedData)) {
      return JSON.parse(decryptedData); // Only parse if it's JSON
    }
    return decryptedData; // Return as-is if it's not JSON
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
  document.cookie = `${key}=${encryptedValue}; expires=${expires}; path=/;`;
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
