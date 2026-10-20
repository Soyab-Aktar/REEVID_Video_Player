import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoInfo } from '../../types';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';
import {
  formatBitrate,
  formatDate,
  formatDuration,
  formatFileSize,
} from '../../utils/formatters';

interface VideoInfoModalProps {
  visible: boolean;
  videoInfo: VideoInfo | null;
  onClose: () => void;
}

export const VideoInfoModal: React.FC<VideoInfoModalProps> = ({
  visible,
  videoInfo,
  onClose,
}) => {
  if (!videoInfo) return null;

  const infoRows = [
    { label: Strings.labelFileName, value: videoInfo.fileName },
    { label: Strings.labelPath, value: videoInfo.path },
    {
      label: Strings.labelSize,
      value: `${videoInfo.width} × ${videoInfo.height}`,
    },
    {
      label: Strings.labelDuration,
      value: formatDuration(videoInfo.duration),
    },
    {
      label: Strings.labelLastModify,
      value: formatDate(videoInfo.dateModified),
    },
    {
      label: Strings.labelFileSize,
      value: formatFileSize(videoInfo.fileSize),
    },
    {
      label: Strings.labelBitrate,
      value: formatBitrate(videoInfo.bitrate),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.title}>{Strings.menuVideoInfo}</Text>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {infoRows.map((row, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.value} selectable>
                  {row.value}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>{Strings.btnClose}</Text>
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
    backgroundColor: Colors.blackOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  body: {
    marginBottom: Spacing.lg,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
  },
  value: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Spacing.xs,
  },
  closeBtn: {
    backgroundColor: Colors.surfaceVariant,
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
  },
  closeBtnText: {
    ...Typography.titleMedium,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
