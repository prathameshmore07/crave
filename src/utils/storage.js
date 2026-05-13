/**
 * Storage Utility for User-Specific Data Persistence
 * 
 * This module isolates all account-specific data (cart, order history, 
 * reviews, favourites, notifications, search history, etc.) by automatically 
 * prefixing localStorage keys with the active user's sanitized email address.
 * 
 * If no user is logged in, a 'guest' scope is used as a safe fallback.
 */

export const getUserStorageKey = (baseKey) => {
  const storedUser = localStorage.getItem('auth_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.email) {
        // Sanitize email to form a clean alphanumeric key segment
        const sanitizedEmail = user.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        return `${baseKey}_usr_${sanitizedEmail}`;
      }
    } catch (e) {
      console.error("Error parsing auth_user in storage utility:", e);
    }
  }
  return `${baseKey}_usr_guest`;
};

/**
 * Safely retrieves a raw string value from user-scoped localStorage
 */
export const getUserItem = (baseKey, fallback = null) => {
  try {
    const key = getUserStorageKey(baseKey);
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch (e) {
    console.error(`Error reading scoped localStorage key [${baseKey}]:`, e);
    return fallback;
  }
};

/**
 * Safely retrieves a JSON-parsed object/array from user-scoped localStorage
 */
export const getUserJsonItem = (baseKey, fallback = null) => {
  try {
    const value = getUserItem(baseKey);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    console.error(`Error parsing JSON from scoped localStorage key [${baseKey}]:`, e);
    return fallback;
  }
};

/**
 * Safely writes a value (string or object) to user-scoped localStorage
 */
export const setUserItem = (baseKey, value) => {
  try {
    const key = getUserStorageKey(baseKey);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  } catch (e) {
    console.error(`Error writing to scoped localStorage key [${baseKey}]:`, e);
  }
};

/**
 * Safely deletes a user-scoped key from localStorage
 */
export const removeUserItem = (baseKey) => {
  try {
    const key = getUserStorageKey(baseKey);
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error deleting scoped localStorage key [${baseKey}]:`, e);
  }
};
