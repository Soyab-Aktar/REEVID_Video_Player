import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FolderItem } from '../../types';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface FolderOptionsMenuProps {
  visible: boolean;
  folder: FolderItem | null;
  onClose: () => void;
  onTogglePin: (folder: FolderItem) => void;
}

export const FolderOptionsMenu: React.FC<FolderOptionsMenuProps> = ({
  visible,
  folder,
  onClose,
  onTogglePin,
}) => {
  if (!folder) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="folder-outline" size={20} color={Colors.folderIcon} />
            <Text style={styles.folderTitle} numberOfLines={1}>
              {folder.name}
            </Text>
          </View>
          
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
              onTogglePin(folder);
              onClose();
            }}
          >
            <MaterialCommunityIcons
              name={folder.isPinned ? 'pin-off-outline' : 'pin-outline'}
              size={22}
              color={folder.isPinned ? Colors.warning : Colors.pinnedGold}
            />
            <Text style={styles.menuText}>
              {folder.isPinned ? Strings.menuUnpin : Strings.menuPin}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  folderTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginBottom: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginHorizontal: Spacing.sm,
    borderRadius: 12,
    gap: Spacing.md,
  },
  menuText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontSize: 14.5,
    fontWeight: '500',
  },
});
