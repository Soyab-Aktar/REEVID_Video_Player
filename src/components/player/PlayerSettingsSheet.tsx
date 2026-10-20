import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppPreferences } from '../../types';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface PlayerSettingsSheetProps {
  visible: boolean;
  preferences: AppPreferences;
  onUpdatePreferences: (updates: Partial<AppPreferences>) => void;
  onClose: () => void;
}

export const PlayerSettingsSheet: React.FC<PlayerSettingsSheetProps> = ({
  visible,
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Transparent backdrop to tap and dismiss */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Settings Panel Content (matching view_player_setting.xml) */}
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          {/* Header with Close Button */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name="tune-variant"
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.sheetTitle}>{Strings.lblSettings}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={Colors.whiteControl}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Full Screen Mode Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <View style={styles.switchTitleRow}>
                  <MaterialCommunityIcons
                    name="fullscreen"
                    size={20}
                    color={preferences.fullScreen ? Colors.accent : Colors.whiteControl}
                  />
                  <Text style={styles.switchLabel}>{Strings.lblFullScreen}</Text>
                </View>
                <Text style={styles.switchSubLabel}>
                  Auto-hide controls and navbar while video is playing
                </Text>
              </View>
              <Switch
                value={preferences.fullScreen}
                onValueChange={(val) => onUpdatePreferences({ fullScreen: val })}
                trackColor={{
                  false: 'rgba(255, 255, 255, 0.2)',
                  true: Colors.primaryContainer,
                }}
                thumbColor={preferences.fullScreen ? Colors.accent : '#ccc'}
              />
            </View>

            {/* 2. Auto-Swipe Next Video Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <View style={styles.switchTitleRow}>
                  <MaterialCommunityIcons
                    name="gesture-swipe-up"
                    size={20}
                    color={preferences.autoSwipe ? Colors.accent : Colors.whiteControl}
                  />
                  <Text style={styles.switchLabel}>{Strings.lblAutoScroll}</Text>
                </View>
                <Text style={styles.switchSubLabel}>
                  Automatically scroll to the next video when playback ends
                </Text>
              </View>
              <Switch
                value={preferences.autoSwipe}
                onValueChange={(val) => onUpdatePreferences({ autoSwipe: val })}
                trackColor={{
                  false: 'rgba(255, 255, 255, 0.2)',
                  true: Colors.primaryContainer,
                }}
                thumbColor={preferences.autoSwipe ? Colors.accent : '#ccc'}
              />
            </View>

            {/* 3. Fill Screen / Fit Screen Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <View style={styles.switchTitleRow}>
                  <MaterialCommunityIcons
                    name={preferences.centerCrop ? 'crop-free' : 'fit-to-screen-outline'}
                    size={20}
                    color={Colors.whiteControl}
                  />
                  <Text style={styles.switchLabel}>
                    {preferences.centerCrop ? Strings.lblFillScreen : Strings.lblFitScreen}
                  </Text>
                </View>
                <Text style={styles.switchSubLabel}>
                  {preferences.centerCrop
                    ? 'Cropping video to fill entire screen vertically'
                    : 'Fitting complete video within screen (letterboxed)'}
                </Text>
              </View>
              <Switch
                value={preferences.centerCrop}
                onValueChange={(val) => onUpdatePreferences({ centerCrop: val })}
                trackColor={{
                  false: 'rgba(255, 255, 255, 0.2)',
                  true: Colors.primaryContainer,
                }}
                thumbColor={preferences.centerCrop ? Colors.primary : '#ccc'}
              />
            </View>

            {/* 4. Smooth Scrolling Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>
                  {Strings.labelSmoothScroll}
                </Text>
                <Text style={styles.switchSubLabel}>
                  Animate vertical transitions between videos
                </Text>
              </View>
              <Switch
                value={preferences.smoothScroll}
                onValueChange={(val) => onUpdatePreferences({ smoothScroll: val })}
                trackColor={{
                  false: 'rgba(255, 255, 255, 0.2)',
                  true: Colors.primaryContainer,
                }}
                thumbColor={preferences.smoothScroll ? Colors.primary : '#ccc'}
              />
            </View>

            {/* 5. Cover Status Bar Switch */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>
                  {Strings.labelCoverStatusBar}
                </Text>
              </View>
              <Switch
                value={preferences.coverStatusBar}
                onValueChange={(val) => onUpdatePreferences({ coverStatusBar: val })}
                trackColor={{
                  false: 'rgba(255, 255, 255, 0.2)',
                  true: Colors.primaryContainer,
                }}
                thumbColor={preferences.coverStatusBar ? Colors.primary : '#ccc'}
              />
            </View>

            {/* 6. Round Corners Slider */}
            <View style={styles.settingBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.settingLabel}>{Strings.labelCornerSize}</Text>
                <Text style={styles.valueBadge}>
                  {Math.round(preferences.cornerRadius)} dp
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={40}
                step={2}
                value={preferences.cornerRadius}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor={Colors.primary}
                onValueChange={(val) => onUpdatePreferences({ cornerRadius: val })}
              />
            </View>

            {/* 7. Viewport Padding Slider */}
            <View style={styles.settingBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.settingLabel}>{Strings.labelPadding}</Text>
                <Text style={styles.valueBadge}>
                  {Math.round(preferences.viewportPadding)} dp
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={30}
                step={2}
                value={preferences.viewportPadding}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor={Colors.primary}
                onValueChange={(val) => onUpdatePreferences({ viewportPadding: val })}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.blackOverlay,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '75%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sheetTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    color: Colors.text,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  settingBlock: {
    paddingVertical: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  settingLabel: {
    ...Typography.titleMedium,
    fontSize: 14,
    color: Colors.text,
  },
  valueBadge: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 36,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  switchLabel: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scaleSection: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  radioGroup: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    gap: Spacing.md,
  },
  radioOptionSelected: {
    backgroundColor: Colors.surfaceHighlight,
  },
  radioText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  radioTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
