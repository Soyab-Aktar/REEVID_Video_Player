import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FolderSortOption } from '../../types';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface FolderSortModalProps {
  visible: boolean;
  selectedOption: FolderSortOption;
  onSelect: (option: FolderSortOption) => void;
  onClose: () => void;
}

const SORT_ITEMS: { key: FolderSortOption; label: string }[] = [
  { key: 'name_asc', label: Strings.menuSortByNameAsc },
  { key: 'name_desc', label: Strings.menuSortByNameDesc },
  { key: 'date_asc', label: Strings.menuSortByDateAsc },
  { key: 'date_desc', label: Strings.menuSortByDateDesc },
];

export const FolderSortModal: React.FC<FolderSortModalProps> = ({
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
        <View style={styles.modalCard}>
          <Text style={styles.title}>{Strings.menuSort}</Text>

          {SORT_ITEMS.map((item) => {
            const isSelected = selectedOption === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.sortItem, isSelected && styles.selectedSortItem]}
                onPress={() => {
                  onSelect(item.key);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemLabel,
                    isSelected && styles.selectedItemLabel,
                  ]}
                >
                  {item.label}
                </Text>
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
  modalCard: {
    width: '100%',
    maxWidth: 320,
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
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    marginHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  selectedSortItem: {
    backgroundColor: Colors.surfaceVariant,
  },
  itemLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontSize: 14.5,
  },
  selectedItemLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
