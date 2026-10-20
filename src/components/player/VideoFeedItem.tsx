import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoItem } from '../../types';
import { Colors } from '../../constants/theme';

interface VideoFeedItemProps {
  video: VideoItem;
  isActive: boolean;
  isNearActive: boolean;
  isPlaying: boolean;
  centerCrop: boolean;
  cornerRadius: number;
  viewportPadding: number;
  autoSwipe: boolean;
  itemHeight?: number;
  isScrolling?: boolean;
  onSingleTap: () => void;
  onVideoEnd: () => void;
  onProgressUpdate: (currentMs: number, totalMs: number) => void;
  seekPositionMs?: number | null;
}

interface ActiveVideoContentProps {
  video: VideoItem;
  isActive: boolean;
  isPlaying: boolean;
  isScrolling?: boolean;
  centerCrop: boolean;
  autoSwipe: boolean;
  onSingleTap: () => void;
  onVideoEnd: () => void;
  onProgressUpdate: (currentMs: number, totalMs: number) => void;
  seekPositionMs?: number | null;
}

/**
 * Isolated active video player component.
 * Only mounted for items near the viewport (Math.abs(index - activeIndex) <= 1).
 * Unmounting automatically releases the native player and hardware video decoder.
 */
const ActiveVideoContent: React.FC<ActiveVideoContentProps> = ({
  video,
  isActive,
  isPlaying,
  isScrolling,
  centerCrop,
  autoSwipe,
  onSingleTap,
  onVideoEnd,
  onProgressUpdate,
  seekPositionMs,
}) => {
  const [isBuffering, setIsBuffering] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Initialize expo-video player for this item
  const player = useVideoPlayer(video.uri, (p) => {
    p.loop = !autoSwipe;
    p.playbackRate = 1.0;
    p.preservesPitch = true;
    p.timeUpdateEventInterval = 0.5; // Throttled to 500ms to reduce JS bridge load
  });

  // Play only if item is actively viewed, playing state is true, and not mid-swipe
  useEffect(() => {
    if (!player) return;
    if (isActive && isPlaying && !isScrolling) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPlaying, isScrolling, player]);

  // Sync loop/autoSwipe
  useEffect(() => {
    if (!player) return;
    player.loop = !autoSwipe;
  }, [autoSwipe, player]);

  // Handle scrubber external seek
  useEffect(() => {
    if (seekPositionMs !== null && seekPositionMs !== undefined && isActive && player) {
      player.currentTime = seekPositionMs / 1000;
    }
  }, [seekPositionMs, isActive, player]);

  // Event listeners
  useEffect(() => {
    if (!player) return;

    const timeUpdateSub = player.addListener('timeUpdate', (event) => {
      if (isActive) {
        const currentMs = Math.round(event.currentTime * 1000);
        const totalMs = Math.round((player.duration || video.duration / 1000) * 1000);
        onProgressUpdate(currentMs, totalMs);
      }
    });

    const statusChangeSub = player.addListener('statusChange', ({ status }) => {
      setIsBuffering(status === 'loading');
    });

    const playToEndSub = player.addListener('playToEnd', () => {
      if (autoSwipe && isActive) {
        onVideoEnd();
      }
    });

    return () => {
      timeUpdateSub.remove();
      statusChangeSub.remove();
      playToEndSub.remove();
    };
  }, [player, isActive, autoSwipe, onProgressUpdate, onVideoEnd, video.duration]);

  return (
    <>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={centerCrop ? 'cover' : 'contain'}
        nativeControls={false}
        surfaceType="textureView"
        pointerEvents="none"
      />

      {/* Buffering Indicator */}
      {isBuffering && isActive && (
        <View style={styles.bufferingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Paused Overlay Badge */}
      {!isPlaying && isActive && !isBuffering && (
        <View style={styles.playIconContainer} pointerEvents="none">
          <View style={styles.playIconCircle}>
            <MaterialCommunityIcons
              name="play"
              size={48}
              color={Colors.white}
              style={{ marginLeft: 4 }}
            />
          </View>
        </View>
      )}

      {/* Frictionless touch layer for 60fps swipe without responder delay */}
      <View
        style={StyleSheet.absoluteFill}
        onTouchStart={(e) => {
          touchStartRef.current = {
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
            time: Date.now(),
          };
        }}
        onTouchEnd={(e) => {
          if (!touchStartRef.current) return;
          const dx = Math.abs(e.nativeEvent.pageX - touchStartRef.current.x);
          const dy = Math.abs(e.nativeEvent.pageY - touchStartRef.current.y);
          const dt = Date.now() - touchStartRef.current.time;
          touchStartRef.current = null;
          // Clean tap only if movement is within 10px and duration < 300ms
          if (dx < 10 && dy < 10 && dt < 300) {
            onSingleTap();
          }
        }}
        onTouchCancel={() => {
          touchStartRef.current = null;
        }}
      />
    </>
  );
};

const VideoFeedItemComponent: React.FC<VideoFeedItemProps> = ({
  video,
  isActive,
  isNearActive,
  isPlaying,
  centerCrop,
  cornerRadius,
  viewportPadding,
  autoSwipe,
  itemHeight,
  isScrolling,
  onSingleTap,
  onVideoEnd,
  onProgressUpdate,
  seekPositionMs,
}) => {
  const windowDims = useWindowDimensions();
  const width = windowDims.width;
  const height = itemHeight || windowDims.height;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Video Viewport Container with Corner Radius and Padding */}
      <View
        style={[
          styles.viewport,
          {
            borderRadius: cornerRadius,
            margin: viewportPadding,
          },
        ]}
      >
        {isNearActive ? (
          <ActiveVideoContent
            video={video}
            isActive={isActive}
            isPlaying={isPlaying}
            isScrolling={isScrolling}
            centerCrop={centerCrop}
            autoSwipe={autoSwipe}
            onSingleTap={onSingleTap}
            onVideoEnd={onVideoEnd}
            onProgressUpdate={onProgressUpdate}
            seekPositionMs={seekPositionMs}
          />
        ) : (
          <View style={styles.placeholderContainer} />
        )}
      </View>
    </View>
  );
};

export const VideoFeedItem = React.memo(VideoFeedItemComponent, (prev, next) => {
  return (
    prev.video.id === next.video.id &&
    prev.isActive === next.isActive &&
    prev.isNearActive === next.isNearActive &&
    prev.isPlaying === next.isPlaying &&
    prev.isScrolling === next.isScrolling &&
    prev.centerCrop === next.centerCrop &&
    prev.cornerRadius === next.cornerRadius &&
    prev.viewportPadding === next.viewportPadding &&
    prev.autoSwipe === next.autoSwipe &&
    prev.itemHeight === next.itemHeight &&
    prev.seekPositionMs === next.seekPositionMs
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewport: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.black,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black,
  },
  bufferingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
