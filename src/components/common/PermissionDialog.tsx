import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface PermissionDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="folder-lock-open-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Storage Permission Required</Text>
          <Text style={styles.message}>{Strings.msgRequestPermission}</Text>
          <View style={styles.buttonRow}>
            {onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
                <Text style={styles.cancelText}>{Strings.btnCancel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.okBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={styles.okText}>{Strings.btnOk}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.blackTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  cancelBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  cancelText: {
    ...Typography.titleMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  okBtn: {
    backgroundColor: Colors.primaryBrand,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okText: {
    ...Typography.titleMedium,
    fontSize: 14,
    color: Colors.white,
  },
});
