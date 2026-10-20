import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface VideoListAppBarProps {
  folderName: string;
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onBackPress: () => void;
  onExitSelection: () => void;
  onOpenSort: () => void;
  onEnterSelection: () => void;
  onToggleSelectAll: () => void;
  onOpenInfo: () => void;
  onDeleteSelected: () => void;
}

export const VideoListAppBar: React.FC<VideoListAppBarProps> = ({
  folderName,
  isSelectionMode,
  selectedCount,
  totalCount,
  allSelected,
  onBackPress,
  onExitSelection,
  onOpenSort,
  onEnterSelection,
  onToggleSelectAll,
  onOpenInfo,
  onDeleteSelected,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {isSelectionMode ? (
          // Selection Mode App Bar (matching video_list_menu_2.xml)
          <>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onExitSelection}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.whiteControl}
              />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={[styles.title, styles.selectionTitle]} numberOfLines={1}>
                {Strings.titleSelectMode(selectedCount, totalCount)}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              {/* Select All Toggle */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onToggleSelectAll}
                activeOpacity={0.7}
                accessibilityLabel={Strings.menuSelectAll}
              >
                <MaterialCommunityIcons
                  name={allSelected ? 'checkbox-marked-outline' : 'checkbox-multiple-blank-outline'}
                  size={22}
                  color={Colors.whiteControl}
                />
              </TouchableOpacity>

              {/* Video Info: Only visible when exactly 1 item selected */}
              {selectedCount === 1 && (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={onOpenInfo}
                  activeOpacity={0.7}
                  accessibilityLabel={Strings.menuVideoInfo}
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={24}
                    color={Colors.whiteControl}
                  />
                </TouchableOpacity>
              )}

              {/* Delete: Visible when > 0 items selected */}
              {selectedCount > 0 && (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={onDeleteSelected}
                  activeOpacity={0.7}
                  accessibilityLabel={Strings.menuDelete}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={24}
                    color={Colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          // Normal Mode App Bar (matching video_list_menu_1.xml)
          <>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={Colors.whiteControl}
              />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {folderName}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              {/* Sort Action */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onOpenSort}
                activeOpacity={0.7}
                accessibilityLabel={Strings.menuSort}
              >
                <MaterialCommunityIcons
                  name="sort-variant"
                  size={24}
                  color={Colors.whiteControl}
                />
              </TouchableOpacity>

              {/* Select Multiple Action */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onEnterSelection}
                activeOpacity={0.7}
                accessibilityLabel={Strings.menuSelectMode}
              >
                <MaterialCommunityIcons
                  name="checkbox-multiple-marked-outline"
                  size={22}
                  color={Colors.whiteControl}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.appBarBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 18,
    color: Colors.text,
  },
  selectionTitle: {
    color: Colors.primary,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
