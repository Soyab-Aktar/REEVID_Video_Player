import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppPreferences } from '../types';

const STORAGE_KEYS = {
  PREFERENCES: '@revid_preferences',
  PINNED_FOLDERS: '@revid_pinned_folders',
};

const DEFAULT_PREFERENCES: AppPreferences = {
  fullScreen: false,
  autoSwipe: false,
  centerCrop: true,
  videoSort: 'date_desc',
  folderSort: 'date_desc',
  showPinnedOnly: false,
  cornerRadius: 0,
  viewportPadding: 0,
  coverStatusBar: false,
  smoothScroll: true,
};

export const StorageService = {
  async getPreferences(): Promise<AppPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Error reading preferences from storage', e);
    }
    return DEFAULT_PREFERENCES;
  },

  async savePreferences(prefs: Partial<AppPreferences>): Promise<AppPreferences> {
    try {
      const current = await StorageService.getPreferences();
      const updated = { ...current, ...prefs };
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Error saving preferences to storage', e);
      return DEFAULT_PREFERENCES;
    }
  },

  async getPinnedFolders(): Promise<Record<string, number>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PINNED_FOLDERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading pinned folders from storage', e);
    }
    return {};
  },

  async togglePinFolder(folderId: string, folderPath?: string): Promise<Record<string, number>> {
    try {
      const current = await StorageService.getPinnedFolders();
      const updated = { ...current };
      const isCurrentlyPinned =
        folderId in updated || (folderPath ? folderPath in updated : false);

      if (isCurrentlyPinned) {
        delete updated[folderId];
        if (folderPath) delete updated[folderPath];
      } else {
        const nextOrder = Object.keys(updated).length;
        updated[folderId] = nextOrder;
        if (folderPath && folderPath !== folderId) {
          updated[folderPath] = nextOrder;
        }
      }
      await AsyncStorage.setItem(STORAGE_KEYS.PINNED_FOLDERS, JSON.stringify(updated));
      console.log('[REVID] Toggled pin for', folderId, 'Now pinned:', !isCurrentlyPinned);
      return updated;
    } catch (e) {
      console.warn('Error toggling pin on folder', e);
      return {};
    }
  },

  async isFolderPinned(folderId: string, folderPath?: string): Promise<boolean> {
    const pinned = await StorageService.getPinnedFolders();
    return folderId in pinned || (folderPath ? folderPath in pinned : false);
  },
};
