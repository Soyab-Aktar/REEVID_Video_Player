# REVID — Offline Short Video Player (React Native Clone)

**REVID** is a high-performance offline vertical short video player built with **React Native & Expo (TypeScript)**, meticulously cloned and reconstructed from the reverse-engineered Android APK **"Short Video.apk"** (`shortvideo.vertical.video.player`).

---

## 🌟 Key Features

### 1. Folder Explorer (`MainActivity` Clone)
- **Automatic Folder Detection**: Queries device storage media and groups short videos by parent folder (Camera, TikTok, Instagram, Shorts, WhatsApp Video, ScreenRecorder).
- **Pin to Top**: Pin favorite folders to the top of the list with a gold pin badge.
- **Filter**: Toggle between "Show all folders" and "Show only pinned folders".
- **Sorting**: Name (A-Z, Z-A), Modified date (newest/oldest).
- **Live Search**: In-header finder filter bar for immediate folder searching.
- **Pull-to-Refresh**: Instant rescan of local storage.

### 2. Video Grid View (`VideoListActivity` Clone)
- **Thumbnail Grid**: Responsive multi-column thumbnail cards with video duration pill badges (`00:15`) and file sizes.
- **Multi-Selection Mode**:
  - Checkbox selection ticks (`ic_tick`).
  - Dynamic action bar title showing `X/Y items selected`.
  - "Select All" toggle button.
  - Batch Delete action with confirmation prompt.
  - Video Technical Info Dialog (`dialog_info.xml`).
- **Video Sorting**: Date modified, File name, File size (smallest/largest), and **Shuffle**.

### 3. Vertical Short Video Player (`PlayerActivity` Clone)
- **TikTok/Reels Vertical Snapping Feed**:
  - Fullscreen vertical swipe-up and swipe-down gestures for instant, seamless video transitions.
  - Pre-buffering of adjacent videos for zero-latency switching.
- **Interactive Gestures**:
  - **Single Tap**: Toggles Play/Pause and shows/hides control HUD. Central play badge overlay appears when paused.
  - **Long Press (Hold for 2X)**: Holding your finger on the screen dynamically accelerates playback to **2.0X Fast-Forward** with an animated pulsing `2X SPEED` badge. Releases back to 1.0X.
- **Auto-Swipe vs Continuous Loop**:
  - When Auto-Swipe is enabled, reaching the end of a video automatically scrolls to the next video (`STATE_ENDED`).
  - When disabled, loops the active video continuously (`Repeat`).
- **Scale Mode**: Toggle between **Fit screen** (`centerInside` letterboxing) and **Fill screen** (`centerCrop` immersive fill).
- **Interactive Scrubber**: Bottom seekbar with timestamps (`00:07 / 00:15`) and touch-scrubbing.

### 4. Advanced Settings Panel (`view_player_setting.xml` Clone)
- **Round Corners**: Adjustable video corner radius slider (0 to 40 dp).
- **Padding**: Viewport padding slider (0 to 30 dp).
- **Cover Status Bar**: Fullscreen immersive toggle.
- **Smooth Scrolling**: Scroll animation interpolation toggle.
- **Scale Type**: Radio selector for Center Inside vs Center Crop.

---

## 🚀 How to Run

Navigate into the `REVID` directory:
```bash
cd /home/soyab-aktar/Desktop/REV_APP/REVID
```

### 1. Run on Android Device / Emulator:
```bash
npx expo run:android
# or with Expo Go
npx expo start --android
```

### 2. Run in Web Browser:
```bash
npm run web
# or
npx expo start --web
```
Access the application at `http://localhost:8081`.

### 3. Run on iOS Simulator:
```bash
npx expo start --ios
```

---

## 📁 Project Architecture

```
REVID/
├── App.tsx                        # Root Navigation & Screen Orchestration
├── package.json                   # Dependencies (expo, expo-av, expo-media-library, etc.)
└── src/
    ├── types/                     # TypeScript Interfaces (FolderItem, VideoItem, VideoInfo, AppPreferences)
    ├── constants/
    │   ├── theme.ts               # Theme tokens & colors (#211F26, #121212, #6750A4)
    │   └── strings.ts             # Decompiled String resources
    ├── services/
    │   ├── mediaService.ts        # Native MediaLibrary scanner & folder grouping
    │   └── storage.ts             # AsyncStorage persistence for pins & preferences
    ├── sampleData/
    │   └── defaultVideos.ts       # Sample vertical short-form videos with rich metadata
    ├── utils/
    │   └── formatters.ts          # Duration, File size, Date, and Bitrate formatters
    ├── components/
    │   ├── common/                # EmptyState, PermissionDialog, ToastMessage
    │   ├── folder/                # FolderAppBar, FolderItemRow, FolderOptionsMenu, FolderSortModal
    │   ├── videoList/             # VideoListAppBar, VideoThumbnailCard, VideoSortModal, VideoInfoModal, DeleteConfirmModal
    │   └── player/                # VideoFeedItem, PlayerProgressBar, PlayerControlHUD, PlayerSettingsSheet
    └── screens/
        ├── FolderExplorerScreen.tsx  # Screen 1: Folder Explorer (MainActivity clone)
        ├── VideoGridScreen.tsx       # Screen 2: Folder Video Grid (VideoListActivity clone)
        └── VerticalPlayerScreen.tsx  # Screen 3: Vertical Reels/Shorts Player (PlayerActivity clone)
```
