export const Strings = {
  appName: 'REEVID',
  appTitle: 'REEVID',
  appIconLabel: 'REEVID',
  
  // Folder Explorer
  hintSearch: 'Find folder',
  menuSearch: 'Find',
  menuSort: 'Sort by…',
  menuSortByNameAsc: 'File name - A to Z',
  menuSortByNameDesc: 'File name - Z to A',
  menuSortByDateAsc: 'Modified - oldest first',
  menuSortByDateDesc: 'Modified - newest first',
  menuSortBySizeAsc: 'Size - smallest first',
  menuSortBySizeDesc: 'Size - largest first',
  menuSortByShuffle: 'Shuffle',
  menuShowPinnedOnly: 'Show only pinned folders',
  menuShowAllFolders: 'Show all folders',
  menuPin: 'Pin to top',
  menuUnpin: 'Unpin',
  menuSelectMode: 'Select multiple',
  menuSelectAll: 'Select all',
  menuDelete: 'Delete',
  menuVideoInfo: 'Video info',
  menuCloseSearch: 'Close finder',
  
  // Messages & Dialogs
  msgNoItemFound: 'No videos found on your device.',
  msgNoPinned: 'No folders are pinned. Please pin your favorite folders to the top of the list first.',
  msgAutoSwipeOn: 'Auto swipe ON',
  msgAutoSwipeOff: 'Auto swipe OFF',
  msgDeleteConfirm: 'Are you sure you want to delete this video?',
  msgDeleteConfirmMulti: (count: number) => `Are you sure you want to delete these ${count} items?`,
  msgRequestPermission: 'In order to access and display your video files, we need permission to access your storage. This allows the app to find and play your videos.',
  
  // Video Labels
  folderVideoCount: (count: number) => `${count} video ${count === 1 ? 'item' : 'items'}`,
  titleSelectMode: (selected: number, total: number) => `${selected}/${total} ${selected === 1 ? 'item' : 'items'} selected`,
  
  // Player Controls
  lblAutoScroll: 'Auto swipe',
  lblAutoScrollExit: 'Repeat',
  lblDelete: 'Delete',
  lblInfo: 'Info',
  lblShare: 'Share',
  lblFullScreen: 'Fullscreen',
  lblFullScreenExit: 'Exit fullscreen',
  lblFitScreen: 'Fit screen',
  lblFillScreen: 'Fill screen',
  lblSettings: 'Settings',
  
  // Settings Panel
  labelCornerSize: 'Round corners',
  labelPadding: 'Padding',
  labelCoverStatusBar: 'Cover status bar when in fullscreen mode',
  labelSmoothScroll: 'Smooth scrolling',
  labelScaleType: 'Video scale type',
  labelCenterInside: 'Center inside (Fit)',
  labelCenterCrop: 'Center crop (Fill)',
  
  // Video Info Dialog
  labelFileName: 'File name:',
  labelPath: 'Path:',
  labelSize: 'Resolution:',
  labelDuration: 'Duration:',
  labelLastModify: 'Last modified:',
  labelFileSize: 'File size:',
  labelBitrate: 'Bitrate:',
  
  btnOk: 'OK',
  btnCancel: 'Cancel',
  btnClose: 'Close',
  btnDelete: 'Delete',
  btnBack: 'Back',
};
