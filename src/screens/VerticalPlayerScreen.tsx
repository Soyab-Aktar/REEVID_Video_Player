import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppPreferences, VideoInfo, VideoItem } from '../types';
import { StorageService } from '../services/storage';
import { MediaService } from '../services/mediaService';
import { Colors, Spacing } from '../constants/theme';
import { Strings } from '../constants/strings';
import { VideoFeedItem } from '../components/player/VideoFeedItem';
import { PlayerProgressBar } from '../components/player/PlayerProgressBar';
import { PlayerControlHUD } from '../components/player/PlayerControlHUD';
import { PlayerSettingsSheet } from '../components/player/PlayerSettingsSheet';
import { VideoInfoModal } from '../components/videoList/VideoInfoModal';
import { DeleteConfirmModal } from '../components/videoList/DeleteConfirmModal';
import { ToastMessage } from '../components/common/ToastMessage';

interface VerticalPlayerScreenProps {
  playlist: VideoItem[];
  initialIndex: number;
  onBack: () => void;
  onVideoDeleted?: (deletedVideoId: string) => void;
}

export const VerticalPlayerScreen: React.FC<VerticalPlayerScreenProps> = ({
  playlist: initialPlaylist,
  initialIndex,
  onBack,
  onVideoDeleted,
}) => {
  const { height } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(height);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [videos, setVideos] = useState<VideoItem[]>(initialPlaylist);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeIndexRef = useRef(initialIndex);
  const isScrollingRef = useRef(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const isPlayingRef = useRef(true);
  const fullScreenRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Hide the Android notification panel / status bar when watching videos
  useEffect(() => {
    StatusBar.setHidden(true, 'fade');
    return () => {
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  // Position & Scrubber state
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [seekTargetMs, setSeekTargetMs] = useState<number | null>(null);

  // Modals & Sheets
  const [settingsSheetVisible, setSettingsSheetVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [activeVideoInfo, setActiveVideoInfo] = useState<VideoInfo | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // App preferences
  const [preferences, setPreferences] = useState<AppPreferences>({
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
  });

  useEffect(() => {
    fullScreenRef.current = preferences.fullScreen;
  }, [preferences.fullScreen]);

  // Load preferences
  useEffect(() => {
    (async () => {
      const prefs = await StorageService.getPreferences();
      setPreferences(prefs);
      fullScreenRef.current = prefs.fullScreen;
      if (prefs.fullScreen) {
        setIsControlsVisible(false);
      }
    })();
  }, []);

  // Update preferences
  const handleUpdatePreferences = async (updates: Partial<AppPreferences>) => {
    const next = { ...preferences, ...updates };
    setPreferences(next);
    if (updates.fullScreen !== undefined) {
      fullScreenRef.current = updates.fullScreen;
      setIsControlsVisible(!updates.fullScreen);
    }
    await StorageService.savePreferences(updates);
  };

  // Close modals or sheets on hardware back press before closing player
  useEffect(() => {
    const onBackPress = () => {
      if (settingsSheetVisible) {
        setSettingsSheetVisible(false);
        return true;
      }
      if (infoModalVisible) {
        setInfoModalVisible(false);
        return true;
      }
      if (deleteModalVisible) {
        setDeleteModalVisible(false);
        return true;
      }
      return false; // let App.tsx handle closing player
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [settingsSheetVisible, infoModalVisible, deleteModalVisible]);

  // Synchronize active video when scrolling settles on an index
  const syncToVideo = useCallback((nextIdx: number) => {
    if (nextIdx >= 0 && nextIdx < videos.length && nextIdx !== activeIndexRef.current) {
      activeIndexRef.current = nextIdx;
      setActiveIndex(nextIdx);
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsControlsVisible(!fullScreenRef.current);
      setCurrentPositionMs(0);
      setSeekTargetMs(null);
    }
  }, [videos.length]);

  // Viewable items tracker (TikTok/Reels vertical scroll snap)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null && viewableItems[0].index !== undefined) {
        const nextIndex = viewableItems[0].index;
        syncToVideo(nextIndex);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 75,
    minimumViewTime: 100,
  }).current;

  const handleScrollBeginDrag = useCallback(() => {
    isScrollingRef.current = true;
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  const handleMomentumScrollBegin = useCallback(() => {
    isScrollingRef.current = true;
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  }, []);

  // Settle slow release (low velocity drag) without relying only on momentum
  const handleScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = event.nativeEvent.velocity?.y || 0;
    if (Math.abs(velocityY) < 0.2) {
      const itemH = containerHeight || height;
      if (itemH > 0) {
        const offsetY = event.nativeEvent.contentOffset.y;
        const targetIdx = Math.round(offsetY / itemH);
        if (targetIdx >= 0 && targetIdx < videos.length) {
          flatListRef.current?.scrollToIndex({
            index: targetIdx,
            animated: true,
          });
          syncToVideo(targetIdx);
        }
      }
      isScrollingRef.current = false;
      setIsScrolling(false);
    }
  }, [containerHeight, height, videos.length, syncToVideo]);

  // Snappy momentum sync for fast swiping (TikTok/Insta flick)
  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    isScrollingRef.current = false;
    setIsScrolling(false);

    const itemH = containerHeight || height;
    if (itemH <= 0) return;
    const offsetY = event.nativeEvent.contentOffset.y;
    const nextIdx = Math.round(offsetY / itemH);
    syncToVideo(nextIdx);
  }, [containerHeight, height, syncToVideo]);

  // Progress update callback throttled and paused during active scrolling
  const handleProgressUpdate = useCallback((cur: number, total: number) => {
    if (isScrollingRef.current) return;
    setCurrentPositionMs(cur);
    setDurationMs(total);
  }, []);

  // Single Tap: toggles play/pause and respects fullscreen mode
  const handleSingleTap = useCallback(() => {
    if (isScrollingRef.current) return;
    setIsPlaying((prev) => {
      const nextPlaying = !prev;
      isPlayingRef.current = nextPlaying;
      if (!nextPlaying) {
        // Paused: always reveal controls so user can scrub, share, view info, or delete
        setIsControlsVisible(true);
      } else {
        // Resuming play: hide controls if fullscreen mode is active, otherwise keep visible
        setIsControlsVisible(!fullScreenRef.current);
      }
      return nextPlaying;
    });
  }, []);

  // Auto-swipe when video ends (matching onPlaybackStateChanged in s.java)
  const handleVideoEnd = useCallback(() => {
    if (videos.length === 0) return;
    const nextIndex = activeIndexRef.current < videos.length - 1 ? activeIndexRef.current + 1 : 0;
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: preferences.smoothScroll,
    });
  }, [videos.length, preferences.smoothScroll]);

  // Share Button Handler (shares video file via native Android share sheet)
  const handleShareCurrentVideo = async () => {
    const currentVideo = videos[activeIndex];
    if (!currentVideo) return;
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(currentVideo.uri, {
          mimeType: 'video/*',
          dialogTitle: `Share ${currentVideo.fileName}`,
        });
      } else {
        await Share.share({
          title: currentVideo.fileName,
          message: `Watch ${currentVideo.fileName}`,
          url: currentVideo.uri,
        });
      }
    } catch (err) {
      console.warn('[REVID] Share error:', err);
    }
  };

  // Info Button Handler
  const handleOpenInfo = () => {
    const currentVideo = videos[activeIndex];
    if (currentVideo) {
      const info = MediaService.getVideoInfo(currentVideo);
      setActiveVideoInfo(info);
      setInfoModalVisible(true);
    }
  };

  // Delete Video in Player (matching u(int i6) in PlayerActivity.java)
  const handleConfirmDelete = async () => {
    setDeleteModalVisible(false);
    const videoToDelete = videos[activeIndex];
    if (!videoToDelete) return;

    await MediaService.deleteVideos([videoToDelete.id]);
    onVideoDeleted?.(videoToDelete.id);

    const updated = videos.filter((_, idx) => idx !== activeIndex);
    if (updated.length === 0) {
      onBack();
      return;
    }

    setVideos(updated);
    const nextIdx = Math.min(activeIndex, updated.length - 1);
    setActiveIndex(nextIdx);
  };

  const currentVideo = videos[activeIndex] || videos[0];

  const effectiveHeight = containerHeight > 0 ? containerHeight : height;

  const keyExtractor = useCallback((item: VideoItem) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: effectiveHeight,
      offset: effectiveHeight * index,
      index,
    }),
    [effectiveHeight]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: VideoItem; index: number }) => {
      const isCurActive = index === activeIndex;
      const isNear = Math.abs(index - activeIndex) <= 1;
      return (
        <VideoFeedItem
          video={item}
          isActive={isCurActive}
          isNearActive={isNear}
          isPlaying={isPlaying}
          isScrolling={isScrolling}
          centerCrop={preferences.centerCrop}
          cornerRadius={preferences.cornerRadius}
          viewportPadding={preferences.viewportPadding}
          autoSwipe={preferences.autoSwipe}
          itemHeight={effectiveHeight}
          onSingleTap={handleSingleTap}
          onVideoEnd={handleVideoEnd}
          onProgressUpdate={handleProgressUpdate}
          seekPositionMs={isCurActive ? seekTargetMs : null}
        />
      );
    },
    [
      activeIndex,
      isPlaying,
      isScrolling,
      preferences.centerCrop,
      preferences.cornerRadius,
      preferences.viewportPadding,
      preferences.autoSwipe,
      effectiveHeight,
      handleSingleTap,
      handleVideoEnd,
      handleProgressUpdate,
      seekTargetMs,
    ]
  );

  // Controls visibility:
  // When in fullscreen mode: ALWAYS hide while playing, ONLY show when paused.
  // When in normal mode: show controls when isControlsVisible is true OR when paused.
  const shouldShowControls = preferences.fullScreen
    ? (!isPlaying && isControlsVisible)
    : (isControlsVisible || !isPlaying);

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && Math.abs(h - containerHeight) > 1) {
          setContainerHeight(h);
        }
      }}
    >
      <StatusBar hidden={true} showHideTransition="fade" />

      {/* Vertical Snapping Video Feed (TikTok/Instagram smooth 1-card-at-a-time flick) */}
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        pagingEnabled={false}
        snapToInterval={effectiveHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        overScrollMode="never"
        bounces={false}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        removeClippedSubviews={false}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 50);
        }}
      />

      {/* Floating Back Button (matching R.id.back in activity_player.xml) */}
      {shouldShowControls && (
        <TouchableOpacity
          style={[styles.floatingBackBtn, { top: insets.top + Spacing.sm }]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color={Colors.white} />
        </TouchableOpacity>
      )}

      {/* Bottom HUD Overlay (Seekbar + 4 Action Buttons) */}
      {shouldShowControls && (
        <View
          style={[
            styles.bottomHudContainer,
            { paddingBottom: insets.bottom + Spacing.xs },
          ]}
        >
          {/* Interactive Seekbar Scrubber */}
          <PlayerProgressBar
            currentPositionMs={currentPositionMs}
            durationMs={durationMs}
            onSlidingComplete={(targetMs) => {
              setSeekTargetMs(targetMs);
              setCurrentPositionMs(targetMs);
            }}
          />

          {/* Bottom Action Bar (4 Iconic Buttons: Delete, Info, Share, Settings) */}
          <PlayerControlHUD
            onDeletePress={() => setDeleteModalVisible(true)}
            onInfoPress={handleOpenInfo}
            onSharePress={handleShareCurrentVideo}
            onOpenSettings={() => setSettingsSheetVisible(true)}
          />
        </View>
      )}

      {/* Settings BottomSheet Modal */}
      <PlayerSettingsSheet
        visible={settingsSheetVisible}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onClose={() => setSettingsSheetVisible(false)}
      />

      {/* Video Info Modal */}
      <VideoInfoModal
        visible={infoModalVisible}
        videoInfo={activeVideoInfo}
        onClose={() => {
          setInfoModalVisible(false);
          setActiveVideoInfo(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        count={1}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />

      {/* Feedback Toast Notification */}
      <ToastMessage
        visible={toastVisible}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  floatingBackBtn: {
    position: 'absolute',
    left: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomHudContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.blackTransparent,
    paddingTop: Spacing.xs,
    zIndex: 20,
  },
});
