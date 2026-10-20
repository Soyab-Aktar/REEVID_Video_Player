import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { formatDuration } from '../../utils/formatters';

interface PlayerProgressBarProps {
  currentPositionMs: number;
  durationMs: number;
  onSlidingStart?: () => void;
  onSlidingComplete: (valueMs: number) => void;
}

export const PlayerProgressBar: React.FC<PlayerProgressBarProps> = ({
  currentPositionMs,
  durationMs,
  onSlidingStart,
  onSlidingComplete,
}) => {
  const safeDuration = Math.max(1000, durationMs);
  const safePosition = Math.min(currentPositionMs, safeDuration);

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={safeDuration}
        value={safePosition}
        minimumTrackTintColor={Colors.whiteControl}
        maximumTrackTintColor="rgba(255, 255, 255, 0.25)"
        thumbTintColor={Colors.white}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={onSlidingComplete}
      />
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>
          {formatDuration(safePosition)}
        </Text>
        <Text style={styles.timeText}>
          {formatDuration(safeDuration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  slider: {
    width: '100%',
    height: 32,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginTop: -4,
  },
  timeText: {
    ...Typography.bodySmall,
    color: Colors.whiteControl,
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
