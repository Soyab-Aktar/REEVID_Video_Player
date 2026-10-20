import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import { Linking, Platform } from 'react-native';
import {
  FolderItem,
  FolderSortOption,
  VideoInfo,
  VideoItem,
  VideoSortOption,
} from '../types';
import { SAMPLE_VIDEOS } from '../sampleData/defaultVideos';
import { StorageService } from './storage';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type PermissionLevel = 'full' | 'limited' | 'denied';

export interface MediaDiagnostics {
  permissionLevel: PermissionLevel;
  androidSdk: number;
  totalAssetsFound: number;
  videoAssetsFound: number;
  albumsFound: number;
  foldersWithVideos: number;
  errorMessage?: string;
}

// ─────────────────────────────────────────────────────────────
// Session caches
// ─────────────────────────────────────────────────────────────
let _permissionLevel: PermissionLevel | null = null;
let _foldersCache: FolderItem[] | null = null;
const _albumVideosCache = new Map<string, VideoItem[]>();

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function getAndroidSdk(): number {
  if (Platform.OS !== 'android') return 0;
  return typeof Platform.Version === 'number'
    ? Platform.Version
    : parseInt(String(Platform.Version), 10);
}

function extractFolderInfoFromUri(uri: string): { folderId: string; folderName: string } {
  try {
    const clean = uri.replace(/^file:\/\//, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.length > 1) {
      const folderName = parts[parts.length - 2];
      const folderPath = parts.slice(0, parts.length - 1).join('/');
      return { folderId: folderPath, folderName };
    }
  } catch {
    /* ignore */
  }
  return { folderId: '__videos__', folderName: 'Videos' };
}

/**
 * Accurately extracts the best timestamp (in ms) from an Asset.
 * Evaluates modificationTime, creationTime (DATE_TAKEN), and parses filename if needed.
 */
function getAssetDate(asset: MediaLibrary.Asset): number {
  let mod = asset.modificationTime || 0;
  let create = asset.creationTime || 0;

  // Convert from seconds to milliseconds if needed (< 10000000000 ms = before year 2286)
  if (mod > 0 && mod < 10000000000) mod *= 1000;
  if (create > 0 && create < 10000000000) create *= 1000;

  // Prefer the newer valid timestamp between modification and creation
  let best = Math.max(mod, create);

  // Fallback: parse date from filename if MediaStore returned 0
  // e.g. VID_20241016_212500, PXL_20241016..., 2024-10-16..., Screen_Recording_20241015...
  if (best <= 0 && asset.filename) {
    const match = asset.filename.match(
      /(20\d{2})[-_]?(\d{2})[-_]?(\d{2})[-_]?(\d{2})?[-_]?(\d{2})?[-_]?(\d{2})?/
    );
    if (match) {
      const [_, y, m, d, h, min, s] = match;
      const year = parseInt(y, 10);
      const month = parseInt(m, 10) - 1;
      const day = parseInt(d, 10);
      if (year >= 2000 && year <= 2035 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const hours = h ? parseInt(h, 10) : 12;
        const minutes = min ? parseInt(min, 10) : 0;
        const seconds = s ? parseInt(s, 10) : 0;
        const parsed = new Date(year, month, day, hours, minutes, seconds).getTime();
        if (!isNaN(parsed) && parsed > 0) {
          best = parsed;
        }
      }
    }
  }

  return best;
}

function assetToVideoItem(
  asset: MediaLibrary.Asset,
  folderPath: string,
  folderName: string
): VideoItem {
  return {
    id: asset.id,
    fileName: asset.filename || `VID_${asset.id}.mp4`,
    uri: asset.uri,
    thumbnailUri: asset.uri,
    duration: Math.round((asset.duration || 0) * 1000),
    fileSize: 0,
    dateModified: getAssetDate(asset),
    width: asset.width || 1080,
    height: asset.height || 1920,
    folderPath,
    folderName,
  };
}

// ─────────────────────────────────────────────────────────────
// MediaService
// ─────────────────────────────────────────────────────────────
export const MediaService = {
  /**
   * Open the app's system permission settings page.
   */
  openAppSettings(): void {
    Linking.openSettings().catch(() => {
      console.warn('[REVID] Could not open app settings.');
    });
  },

  /**
   * Reset all session caches.
   */
  clearCache(): void {
    _permissionLevel = null;
    _foldersCache = null;
    _albumVideosCache.clear();
    console.log('[REVID] Cache cleared.');
  },

  /**
   * Directly mutate pinned state in cache for instantaneous UI response.
   */
  toggleFolderPinInCache(folderId: string, folderPath?: string): void {
    if (!_foldersCache) return;
    _foldersCache = _foldersCache.map((f) => {
      if (f.id === folderId || f.path === folderId || (folderPath && f.path === folderPath)) {
        const nextPinned = !f.isPinned;
        return { ...f, isPinned: nextPinned, pinOrder: nextPinned ? 0 : -1 };
      }
      return f;
    });
  },

  // ─────────────────────────────────────────────────────
  // Permission Management
  // ─────────────────────────────────────────────────────
  async requestPermissions(): Promise<PermissionLevel> {
    if (Platform.OS === 'web') return 'full';
    if (_permissionLevel !== null) return _permissionLevel;

    try {
      const response = await MediaLibrary.requestPermissionsAsync(false);
      console.log('[REVID] Permission response:', JSON.stringify(response));

      if (response.status === 'granted') {
        if (response.accessPrivileges === 'limited') {
          _permissionLevel = 'limited';
          console.warn('[REVID] LIMITED permission granted.');
        } else {
          _permissionLevel = 'full';
          console.log('[REVID] FULL permission granted.');
        }
      } else {
        _permissionLevel = 'denied';
        console.warn('[REVID] Permission denied.');
      }
    } catch (e) {
      console.warn('[REVID] Permission error:', e);
      _permissionLevel = 'denied';
    }

    return _permissionLevel!;
  },

  async checkPermissions(): Promise<PermissionLevel> {
    if (Platform.OS === 'web') return 'full';
    try {
      const response = await MediaLibrary.getPermissionsAsync(false);
      if (response.status === 'granted') {
        return response.accessPrivileges === 'limited' ? 'limited' : 'full';
      }
      return 'denied';
    } catch {
      return 'denied';
    }
  },

  // ─────────────────────────────────────────────────────
  // getFolders — Main entry point for FolderExplorerScreen
  // ─────────────────────────────────────────────────────
  async getFolders(
    sortOption: FolderSortOption = 'date_desc',
    showPinnedOnly: boolean = false,
    forceRefresh: boolean = false
  ): Promise<{ folders: FolderItem[]; diagnostics: MediaDiagnostics }> {
    if (Platform.OS === 'web') {
      const webFolders = MediaService._buildFoldersFromVideos(
        SAMPLE_VIDEOS,
        {},
        sortOption,
        showPinnedOnly
      );
      return {
        folders: webFolders,
        diagnostics: {
          permissionLevel: 'full',
          androidSdk: 0,
          totalAssetsFound: SAMPLE_VIDEOS.length,
          videoAssetsFound: SAMPLE_VIDEOS.length,
          albumsFound: webFolders.length,
          foldersWithVideos: webFolders.length,
        },
      };
    }

    const diag: MediaDiagnostics = {
      permissionLevel: 'denied',
      androidSdk: getAndroidSdk(),
      totalAssetsFound: 0,
      videoAssetsFound: 0,
      albumsFound: 0,
      foldersWithVideos: 0,
    };

    // Step 1: Request / verify permissions
    const permLevel = await MediaService.requestPermissions();
    diag.permissionLevel = permLevel;

    if (permLevel === 'denied') {
      return { folders: [], diagnostics: diag };
    }

    if (permLevel === 'limited') {
      diag.errorMessage =
        'Limited access granted. Grant "Allow all" in Settings to see all video folders.';
    }

    // Always fetch latest pinned map from storage
    const pinnedMap = await StorageService.getPinnedFolders();

    // Use memory cache if available and not force-refreshing
    if (!forceRefresh && _foldersCache !== null) {
      console.log('[REVID] Returning cached', _foldersCache.length, 'folder(s).');
      diag.foldersWithVideos = _foldersCache.length;

      // Always re-sync pinned status from storage so pinned folders immediately update
      const updatedCache = _foldersCache.map((f) => {
        const isPinned = f.id in pinnedMap || f.path in pinnedMap;
        const pinOrder = isPinned ? (pinnedMap[f.id] ?? pinnedMap[f.path] ?? 0) : -1;
        return { ...f, isPinned, pinOrder };
      });
      _foldersCache = updatedCache;

      return {
        folders: MediaService._sortFolders(updatedCache, sortOption, showPinnedOnly),
        diagnostics: diag,
      };
    }

    try {
      // Step 2: Query all video assets & all albums in parallel
      const [assetsSettled, albumsSettled] = await Promise.allSettled([
        MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.video,
          first: 5000,
          sortBy: [MediaLibrary.SortBy.modificationTime],
        }),
        MediaLibrary.getAlbumsAsync({ includeSmartAlbums: false }),
      ]);

      const albumTitleMap = new Map<string, string>();

      if (albumsSettled.status === 'fulfilled') {
        diag.albumsFound = albumsSettled.value.length;
        for (const album of albumsSettled.value) {
          if (album.id && album.title) {
            albumTitleMap.set(album.id, album.title);
          }
        }
        console.log('[REVID] Found', albumTitleMap.size, 'albums in MediaStore.');
      } else {
        console.warn('[REVID] getAlbumsAsync failed:', albumsSettled.reason);
      }

      const flatAssets: MediaLibrary.Asset[] =
        assetsSettled.status === 'fulfilled' ? assetsSettled.value.assets : [];

      diag.videoAssetsFound = flatAssets.length;
      console.log('[REVID] Flat query returned', flatAssets.length, 'video assets.');

      const folderGroups = new Map<
        string,
        {
          name: string;
          videos: MediaLibrary.Asset[];
          latestDate: number;
        }
      >();

      if (flatAssets.length > 0) {
        // Group all flat assets by folder
        for (const asset of flatAssets) {
          let folderId: string | undefined = asset.albumId;
          let folderName: string | undefined = folderId
            ? albumTitleMap.get(folderId)
            : undefined;

          // If no album or unknown title, extract from file URI
          if (!folderName || !folderId) {
            const extracted = extractFolderInfoFromUri(asset.uri);
            if (!folderId) folderId = extracted.folderId;
            if (!folderName) folderName = extracted.folderName;
          }

          if (!folderName) folderName = 'Videos';
          if (!folderId) folderId = folderName;

          const dateMod = getAssetDate(asset);
          const group = folderGroups.get(folderId);
          if (!group) {
            folderGroups.set(folderId, {
              name: folderName,
              videos: [asset],
              latestDate: dateMod,
            });
          } else {
            group.videos.push(asset);
            if (dateMod > group.latestDate) {
              group.latestDate = dateMod;
            }
          }
        }
      }

      const folders: FolderItem[] = [];

      // Convert grouped assets to FolderItems and populate video cache
      folderGroups.forEach((group, folderId) => {
        const isPinned = folderId in pinnedMap;
        folders.push({
          id: folderId,
          name: group.name,
          path: folderId,
          videoCount: group.videos.length,
          isPinned,
          pinOrder: isPinned ? pinnedMap[folderId] : -1,
          dateModified: group.latestDate,
        });

        // Pre-populate per-folder video cache for instant opening
        _albumVideosCache.set(
          folderId,
          group.videos.map((a) => assetToVideoItem(a, folderId, group.name))
        );
      });

      // Fallback Strategy: If flat query returned 0 videos, check albums individually
      if (
        folders.length === 0 &&
        albumsSettled.status === 'fulfilled' &&
        albumsSettled.value.length > 0
      ) {
        console.log('[REVID] Flat query had 0 videos. Trying per-album scan fallback...');
        for (const album of albumsSettled.value) {
          try {
            const check = await MediaLibrary.getAssetsAsync({
              album: album.id,
              mediaType: MediaLibrary.MediaType.video,
              first: 100,
            });
            if (check.assets.length > 0 || check.totalCount > 0) {
              const count = check.totalCount || check.assets.length;
              const isPinned = album.id in pinnedMap;
              folders.push({
                id: album.id,
                name: album.title,
                path: album.id,
                videoCount: count,
                isPinned,
                pinOrder: isPinned ? pinnedMap[album.id] : -1,
                dateModified: album.endTime || Date.now(),
              });
              diag.videoAssetsFound += count;
              if (check.assets.length > 0) {
                _albumVideosCache.set(
                  album.id,
                  check.assets.map((a) => assetToVideoItem(a, album.id, album.title))
                );
              }
            }
          } catch {
            /* ignore individual album failures */
          }
        }
      }

      diag.foldersWithVideos = folders.length;
      _foldersCache = folders;

      console.log('[REVID] Successfully built', folders.length, 'video folder(s).');
      return {
        folders: MediaService._sortFolders(folders, sortOption, showPinnedOnly),
        diagnostics: diag,
      };
    } catch (e: any) {
      console.error('[REVID] getFolders error:', e);
      diag.errorMessage = String(e?.message || e);
      return { folders: [], diagnostics: diag };
    }
  },

  _buildFoldersFromVideos(
    videos: VideoItem[],
    pinnedMap: Record<string, number>,
    sortOption: FolderSortOption,
    showPinnedOnly: boolean
  ): FolderItem[] {
    const map = new Map<string, { name: string; count: number; date: number }>();
    for (const v of videos) {
      const e = map.get(v.folderPath);
      if (!e)
        map.set(v.folderPath, {
          name: v.folderName,
          count: 1,
          date: v.dateModified,
        });
      else {
        e.count++;
        if (v.dateModified > e.date) e.date = v.dateModified;
      }
    }
    const folders: FolderItem[] = [];
    map.forEach((d, path) => {
      const isPinned = path in pinnedMap;
      if (showPinnedOnly && !isPinned) return;
      folders.push({
        id: path,
        name: d.name,
        path,
        videoCount: d.count,
        isPinned,
        pinOrder: isPinned ? pinnedMap[path] : -1,
        dateModified: d.date,
      });
    });
    return MediaService._sortFolders(folders, sortOption, false);
  },

  _sortFolders(
    folders: FolderItem[],
    sortOption: FolderSortOption,
    showPinnedOnly: boolean
  ): FolderItem[] {
    const list = showPinnedOnly ? folders.filter((f) => f.isPinned) : [...folders];
    return list.sort((a, b) => {
      // 1. Pinned folders ALWAYS appear at the very top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isPinned && b.isPinned) {
        if (a.pinOrder !== b.pinOrder) return a.pinOrder - b.pinOrder;
      }

      // 2. Normal sort among unpinned (or within pinned)
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        case 'name_desc':
          return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
        case 'date_asc':
          return a.dateModified - b.dateModified;
        case 'date_desc':
        default:
          return b.dateModified - a.dateModified;
      }
    });
  },

  // ─────────────────────────────────────────────────────
  // getVideosInFolder — Called by VideoGridScreen
  // ─────────────────────────────────────────────────────
  async getVideosInFolder(
    folderPath: string,
    sortOption: VideoSortOption = 'date_desc'
  ): Promise<VideoItem[]> {
    if (Platform.OS === 'web') {
      return MediaService.sortVideos(
        SAMPLE_VIDEOS.filter((v) => v.folderPath === folderPath),
        sortOption
      );
    }

    // 1. Check pre-populated cache for instant load
    if (_albumVideosCache.has(folderPath)) {
      const cached = _albumVideosCache.get(folderPath)!;
      if (cached.length > 0) {
        return MediaService.sortVideos([...cached], sortOption);
      }
    }

    // 2. Fetch from album if not cached
    try {
      const allAssets: MediaLibrary.Asset[] = [];
      let hasNextPage = true;
      let after: string | undefined;

      while (hasNextPage && allAssets.length < 5000) {
        const opts: MediaLibrary.AssetsOptions = {
          mediaType: MediaLibrary.MediaType.video,
          first: 500,
          sortBy: [MediaLibrary.SortBy.modificationTime],
        };
        if (folderPath !== '__no_album__' && folderPath !== '__videos__') {
          opts.album = folderPath;
        }
        if (after) opts.after = after;

        const result = await MediaLibrary.getAssetsAsync(opts);
        if (result.assets.length > 0) allAssets.push(...result.assets);
        hasNextPage = result.hasNextPage;
        after = result.endCursor;
        if (!after || result.assets.length === 0) break;
      }

      // If opts.album returned 0 (e.g. folderPath was a filesystem path not bucket ID)
      if (allAssets.length === 0) {
        const flat = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.video,
          first: 2000,
          sortBy: [MediaLibrary.SortBy.modificationTime],
        });
        const matched = flat.assets.filter((a) => {
          if (a.albumId && a.albumId === folderPath) return true;
          const cleanUri = (a.uri || '').replace(/^file:\/\//, '');
          return cleanUri.includes(folderPath);
        });
        allAssets.push(...matched);
      }

      let folderName = 'Videos';
      try {
        if (folderPath !== '__no_album__' && folderPath !== '__videos__') {
          const album = await MediaLibrary.getAlbumAsync(folderPath);
          if (album?.title) folderName = album.title;
        }
      } catch {
        /* ignore */
      }

      const videos = allAssets.map((a) => assetToVideoItem(a, folderPath, folderName));
      _albumVideosCache.set(folderPath, videos);
      return MediaService.sortVideos([...videos], sortOption);
    } catch (e) {
      console.error('[REVID] getVideosInFolder error:', e);
      return [];
    }
  },

  // ─────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────
  sortVideos(videos: VideoItem[], sortOption: VideoSortOption): VideoItem[] {
    const list = [...videos];
    switch (sortOption) {
      case 'name_asc':
        return list.sort((a, b) =>
          a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
        );
      case 'name_desc':
        return list.sort((a, b) =>
          b.fileName.localeCompare(a.fileName, undefined, { numeric: true, sensitivity: 'base' })
        );
      case 'size_asc':
        return list.sort((a, b) => a.fileSize - b.fileSize);
      case 'size_desc':
        return list.sort((a, b) => b.fileSize - a.fileSize);
      case 'date_asc':
        return list.sort((a, b) => {
          if (a.dateModified !== b.dateModified) {
            return a.dateModified - b.dateModified; // Oldest first
          }
          return a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' });
        });
      case 'shuffle':
        return list.sort(() => Math.random() - 0.5);
      case 'date_desc':
      default:
        return list.sort((a, b) => {
          if (b.dateModified !== a.dateModified) {
            return b.dateModified - a.dateModified; // Higher timestamp = Newest first
          }
          // Secondary fallback sort: newer filename first (e.g. VID_20241017 before VID_20241016)
          return b.fileName.localeCompare(a.fileName, undefined, { numeric: true, sensitivity: 'base' });
        });
    }
  },

  async getAllVideos(forceRefresh: boolean = false): Promise<VideoItem[]> {
    if (Platform.OS === 'web') return SAMPLE_VIDEOS;
    if (!forceRefresh && _albumVideosCache.size > 0) {
      const all: VideoItem[] = [];
      _albumVideosCache.forEach((vids) => all.push(...vids));
      if (all.length > 0) return all;
    }
    try {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        first: 5000,
        sortBy: [MediaLibrary.SortBy.modificationTime],
      });
      return result.assets.map((a) =>
        assetToVideoItem(a, a.albumId || 'unknown', 'Videos')
      );
    } catch {
      return [];
    }
  },

  async deleteVideos(items: (string | VideoItem)[]): Promise<boolean> {
    try {
      const ids = items.map((i) => (typeof i === 'string' ? i : i.id));
      if (Platform.OS !== 'web') {
        await MediaLibrary.deleteAssetsAsync(ids);
      }
      const idSet = new Set(ids);
      _albumVideosCache.forEach((vids, key) =>
        _albumVideosCache.set(key, vids.filter((v) => !idSet.has(v.id)))
      );
      if (_foldersCache) {
        _foldersCache = _foldersCache
          .map((f) => ({
            ...f,
            videoCount: _albumVideosCache.get(f.id)?.length ?? f.videoCount,
          }))
          .filter((f) => f.videoCount > 0);
      }
      return true;
    } catch (e) {
      console.warn('[REVID] deleteVideos error:', e);
      return false;
    }
  },

  async deleteVideo(video: VideoItem): Promise<boolean> {
    return MediaService.deleteVideos([video]);
  },

  getVideoInfo(video: VideoItem): VideoInfo {
    const cleanPath = video.uri ? video.uri.replace(/^file:\/\//, '') : video.fileName;
    return {
      fileName: video.fileName,
      path: cleanPath,
      fileSize: video.fileSize,
      duration: video.duration,
      width: video.width,
      height: video.height,
      dateModified: video.dateModified,
      bitrate: 0,
    };
  },
};
