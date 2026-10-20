import React, { useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface FolderAppBarProps {
  isSearching: boolean;
  searchQuery: string;
  showPinnedOnly: boolean;
  onSearchQueryChange: (query: string) => void;
  onStartSearch: () => void;
  onCloseSearch: () => void;
  onOpenSort: () => void;
  onTogglePinnedOnly: () => void;
}

export const FolderAppBar: React.FC<FolderAppBarProps> = ({
  isSearching,
  searchQuery,
  showPinnedOnly,
  onSearchQueryChange,
  onStartSearch,
  onCloseSearch,
  onOpenSort,
  onTogglePinnedOnly,
}) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {isSearching ? (
          // Active Search Input View (matching w(true) in MainActivity)
          <View style={styles.searchBar}>
            <TouchableOpacity
              onPress={onCloseSearch}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color={Colors.whiteControl}
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={Strings.hintSearch}
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              autoFocus
              returnKeyType="search"
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchQueryChange('')}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={Colors.whiteControl}
                />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Default Toolbar View (matching folder_list_menu_1.xml: Search + 3-Dots)
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{Strings.appTitle}</Text>
            </View>

            <View style={styles.actionsContainer}>
              {/* Search Action */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onStartSearch}
                activeOpacity={0.7}
                accessibilityLabel={Strings.menuSearch}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={26}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* 3-Dots Overflow Menu (matching folder_list_menu_1.xml) */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.7}
                accessibilityLabel="More options"
              >
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={26}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Overflow Popup Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuDropdown, { top: insets.top + 50 }]}>
                {/* Sort Option */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onOpenSort();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="sort"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.menuItemText}>{Strings.menuSort}</Text>
                </TouchableOpacity>

                {/* Show Pinned Only / Show All Toggle */}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onTogglePinnedOnly();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={showPinnedOnly ? 'folder-multiple' : 'pin'}
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.menuItemText}>
                    {showPinnedOnly
                      ? Strings.menuShowAllFolders
                      : Strings.menuShowPinnedOnly}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.appBarBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    paddingLeft: Spacing.xs,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 19,
    color: Colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBarBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xs,
    height: 42,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: Spacing.sm,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: Colors.blackOverlay,
  },
  menuDropdown: {
    position: 'absolute',
    right: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    minWidth: 190,
    paddingVertical: Spacing.xs,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  menuItemText: {
    ...Typography.bodyMedium,
    fontSize: 14.5,
    color: Colors.text,
    fontWeight: '500',
  },
});
