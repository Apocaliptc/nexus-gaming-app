
import { UserStats } from '../types';

export const encodeProfileForSharing = (stats: UserStats): string => {
  try {
    const jsonString = JSON.stringify(stats);
    return btoa(encodeURIComponent(jsonString));
  } catch (e) {
    console.error("Failed to encode profile", e);
    return "";
  }
};

export const decodeProfileFromSharing = (encoded: string): UserStats | null => {
  try {
    const jsonString = decodeURIComponent(atob(encoded));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to decode profile", e);
    return null;
  }
};
