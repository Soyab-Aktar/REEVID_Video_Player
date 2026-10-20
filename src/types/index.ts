export type ScaleMode = 'centerInside' | 'centerCrop';

export type FolderSortOption = 
  | 'name_asc'
  | 'name_desc'
  | 'date_asc'
  | 'date_desc';

export type VideoSortOption = 
  | 'name_asc'
  | 'name_desc'
  | 'date_asc'
  | 'date_desc'
  | 'size_asc'
  | 'size_desc'
  | 'shuffle';

export interface VideoInfo {
  fileName: string;
  path: string;
  fileSize: number; // in bytes
  duration: number; // in milliseconds
  width: number;
  height: number;
  dateModified: number; // timestamp ms
  bitrate: number;
}

export interface VideoItem {
  id: string;
  fileName: string;
  uri: string;
  thumbnailUri?: string;
  duration: number; // in ms
  fileSize: number; // in bytes
  dateModified: number; // timestamp ms
  width: number;
  height: number;
  folderPath: string;
  folderName: string;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  videoCount: number;
  isPinned: boolean;
  pinOrder: number; // -1 if not pinned, 0..n if pinned
  dateModified: number;
}

export interface AppPreferences {
  fullScreen: boolean;
  autoSwipe: boolean;
  centerCrop: boolean;
  videoSort: VideoSortOption;
  folderSort: FolderSortOption;
  showPinnedOnly: boolean;
  cornerRadius: number; // 0 to 40 dp
  viewportPadding: number; // 0 to 30 dp
  coverStatusBar: boolean;
  smoothScroll: boolean;
}
