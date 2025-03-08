
// Interface for user identity data
export interface IdentityData {
  id: string;
  name?: string;
  photoDataUrl: string;
  createdAt: number;
}

// Storage keys
const IDENTITIES_KEY = 'verify-platform-identities';

/**
 * Saves identity data to local storage
 */
export const saveIdentity = (data: IdentityData): void => {
  try {
    // Get existing identities or initialize empty array
    const existingData = getIdentities();
    
    // Check if this ID already exists
    const existingIndex = existingData.findIndex(item => item.id === data.id);
    
    if (existingIndex >= 0) {
      // Update existing
      existingData[existingIndex] = data;
    } else {
      // Add new
      existingData.push(data);
    }
    
    // Save back to localStorage
    localStorage.setItem(IDENTITIES_KEY, JSON.stringify(existingData));
  } catch (error) {
    console.error('Error saving identity:', error);
    throw new Error('Failed to save identity data');
  }
};

/**
 * Gets all identities from local storage
 */
export const getIdentities = (): IdentityData[] => {
  try {
    const data = localStorage.getItem(IDENTITIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving identities:', error);
    return [];
  }
};

/**
 * Gets a single identity by ID
 */
export const getIdentityById = (id: string): IdentityData | null => {
  try {
    const identities = getIdentities();
    return identities.find(identity => identity.id === id) || null;
  } catch (error) {
    console.error('Error retrieving identity:', error);
    return null;
  }
};

/**
 * Deletes an identity by ID
 */
export const deleteIdentity = (id: string): boolean => {
  try {
    const identities = getIdentities();
    const filteredIdentities = identities.filter(identity => identity.id !== id);
    
    if (filteredIdentities.length === identities.length) {
      return false; // No identity was removed
    }
    
    localStorage.setItem(IDENTITIES_KEY, JSON.stringify(filteredIdentities));
    return true;
  } catch (error) {
    console.error('Error deleting identity:', error);
    return false;
  }
};

/**
 * Clears all identity data
 */
export const clearAllIdentities = (): void => {
  try {
    localStorage.removeItem(IDENTITIES_KEY);
  } catch (error) {
    console.error('Error clearing identities:', error);
  }
};
