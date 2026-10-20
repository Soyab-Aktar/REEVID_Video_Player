import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoItem } from '../../types';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { formatDuration, formatFileSize } from '../../utils/formatters';

interface VideoThumbnailCardProps {
  video: VideoItem;
  isSelectionMode: boolean;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const VideoThumbnailCard: React.FC<VideoThumbnailCardProps> = ({
  video,
  isSelectionMode,
  isSelected,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={[styles.innerCard, isSelected && styles.selectedBorder]}>
        {/* Video Thumbnail */}
        {video.thumbnailUri ? (
          <Image
            source={{ uri: video.thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MaterialCommunityIcons
              name="movie-play-outline"
              size={36}
              color={Colors.textTertiary}
            />
          </View>
        )}

        {/* Multi-layered dark scrim for crisp text readability over bright frames */}
        <View style={styles.scrimBottomDeep} />
        <View style={styles.scrimBottom} />

        {/* Duration badge pill */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(video.duration)}
          </Text>
        </View>

        {/* File Name & Size metadata */}
        <View style={styles.infoOverlay}>
          <Text style={styles.fileName} numberOfLines={1}>
            {video.fileName}
          </Text>
          {video.fileSize > 0 ? (
            <Text style={styles.fileSize}>
              {formatFileSize(video.fileSize)}
            </Text>
          ) : null}
        </View>

        {/* Selection Checkbox indicator */}
        {isSelectionMode && (
          <View style={styles.selectionOverlay}>
            <View
              style={[
                styles.checkboxCircle,
                isSelected && styles.checkboxCircleSelected,
              ]}
            >
              {isSelected && (
                <MaterialCommunityIcons
                  name="check-bold"
                  size={15}
                  color={Colors.background}
                />
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    padding: 3.5,
    height: 220,
  },
  innerCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrimBottomDeep: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  scrimBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  durationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  durationText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  infoOverlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 6,
    zIndex: 2,
  },
  fileName: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fileSize: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.68)',
    fontSize: 10.5,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 3,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
