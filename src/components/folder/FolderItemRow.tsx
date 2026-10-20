import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FolderItem } from '../../types';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface FolderItemRowProps {
  folder: FolderItem;
  onPress: (folder: FolderItem) => void;
  onOptionsPress: (folder: FolderItem) => void;
}

export const FolderItemRow: React.FC<FolderItemRowProps> = ({
  folder,
  onPress,
  onOptionsPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(folder)}
      activeOpacity={0.65}
    >
      {/* Folder Icon with Squircle Container */}
      <View style={[styles.iconContainer, folder.isPinned && styles.pinnedIconContainer]}>
        <MaterialCommunityIcons
          name="folder"
          size={24}
          color={folder.isPinned ? Colors.pinnedGold : Colors.folderIcon}
        />
      </View>

      {/* Folder Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.folderName} numberOfLines={1}>
            {folder.name}
          </Text>
          {folder.isPinned && (
            <View style={styles.pinBadge}>
              <MaterialCommunityIcons
                name="pin"
                size={13}
                color={Colors.pinnedGold}
              />
            </View>
          )}
        </View>

        <Text style={styles.path} numberOfLines={1} ellipsizeMode="middle">
          {folder.path}
        </Text>

        <Text style={styles.videoCount}>
          {Strings.folderVideoCount(folder.videoCount)}
        </Text>
      </View>

      {/* 3-Dots Action Button */}
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => onOptionsPress(folder)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.5}
      >
        <MaterialCommunityIcons
          name="dots-vertical"
          size={22}
          color={Colors.textTertiary}
        />
      </TouchableOpacity>

      {/* Hairline Divider aligned with text */}
      <View style={styles.divider} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.folderIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pinnedIconContainer: {
    backgroundColor: 'rgba(251, 192, 45, 0.12)',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  folderName: {
    ...Typography.titleMedium,
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.text,
    flexShrink: 1,
  },
  pinBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  path: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  videoCount: {
    ...Typography.bodySmall,
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    position: 'absolute',
    left: 74,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
  },
});

