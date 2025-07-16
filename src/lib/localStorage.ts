// Types for history management
export type HistoryItem = {
  title?: string;
  time?: number;
};

export type PathTimestamp = Record<string, HistoryItem>;

export type UserLocalData = {
  history: PathTimestamp;
}

/**
 * Get user data from localStorage
 * @param storageKey - The localStorage key (default: 'userDataStore')
 * @returns The user data object from localStorage
 */
export const getUserLocalData = (storageKey: string = 'userDataStore'): UserLocalData => {
  if (typeof window === 'undefined') {
    throw new Error('Tried to access localStorage on the server');
  }

  try {
    const data = localStorage.getItem(storageKey);
    if (!data) return {
      history: {}
    };

    const parsed = JSON.parse(data);
    return (parsed as UserLocalData);
  } catch (error) {
    console.warn('Failed to parse history from localStorage:', error);
    return {
      history: {}
    };
  }
};

/**
 * Add or update a history item in localStorage
 * @param path - The path/route to store in history
 * @param item - The history item data
 * @param storageKey - The localStorage key (default: 'userDataStore')
 */
export const addHistoryItem = (
  path: string,
  item: HistoryItem,
  storageKey: string = 'userDataStore'
): void => {
  if (typeof window === 'undefined') {
    throw new Error('Tried to access localStorage on the server');
  }

  try {
    // Get existing data
    const userData = getUserLocalData();

    // Add/update the history item with timestamp
    userData.history[path] = {
      ...item,
      time: item.time || new Date().valueOf()
    };

    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save history item to localStorage:', error);
  }
};


export const isValidHistoryItem = (item: HistoryItem): boolean => {
  return typeof item === 'object' && item !== null && 'time' in item && typeof item.time === 'number';
};