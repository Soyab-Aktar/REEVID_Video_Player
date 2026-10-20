import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoSortOption } from '../../types';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface VideoSortModalProps {
  visible: boolean;
  selectedOption: VideoSortOption;
  onSelect: (option: VideoSortOption) => void;
  onClose: () => void;
}

const SORT_OPTIONS: { key: VideoSortOption; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'date_desc', label: Strings.menuSortByDateDesc, icon: 'sort-clock-descending-outline' },
  { key: 'date_asc', label: Strings.menuSortByDateAsc, icon: 'sort-clock-ascending-outline' },
  { key: 'name_asc', label: Strings.menuSortByNameAsc, icon: 'sort-alphabetical-ascending' },
  { key: 'name_desc', label: Strings.menuSortByNameDesc, icon: 'sort-alphabetical-descending' },
  { key: 'size_asc', label: Strings.menuSortBySizeAsc, icon: 'sort-numeric-ascending' },
  { key: 'size_desc', label: Strings.menuSortBySizeDesc, icon: 'sort-numeric-descending' },
  { key: 'shuffle', label: Strings.menuSortByShuffle, icon: 'shuffle-variant' },
];

export const VideoSortModal: React.FC<VideoSortModalProps> = ({
  visible,
  selectedOption,
  onSelect,
  onClose,
}) => {
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
        <View style={styles.card}>
          <Text style={styles.title}>{Strings.menuSort}</Text>

          {SORT_OPTIONS.map((item) => {
            const isSelected = selectedOption === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.itemRow, isSelected && styles.selectedRow]}
                onPress={() => {
                  onSelect(item.key);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.leftLabel}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={isSelected ? Colors.primary : Colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.itemText,
                      isSelected && styles.selectedItemText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                {isSelected && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
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
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    ...Typography.titleMedium,
    color: Colors.text,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    fontSize: 17,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    marginHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  selectedRow: {
    backgroundColor: Colors.surfaceVariant,
  },
  leftLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontSize: 14.5,
  },
  selectedItemText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
