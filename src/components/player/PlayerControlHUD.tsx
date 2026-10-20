import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { Strings } from '../../constants/strings';

interface PlayerControlHUDProps {
  onDeletePress: () => void;
  onInfoPress: () => void;
  onSharePress: () => void;
  onOpenSettings: () => void;
}

export const PlayerControlHUD: React.FC<PlayerControlHUDProps> = ({
  onDeletePress,
  onInfoPress,
  onSharePress,
  onOpenSettings,
}) => {
  return (
    <View style={styles.container}>
      {/* Delete Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onDeletePress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="delete-outline"
          size={24}
          color={Colors.whiteControl}
        />
        <Text style={styles.btnLabel} numberOfLines={1}>
          {Strings.lblDelete}
        </Text>
      </TouchableOpacity>

      {/* Info Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onInfoPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={24}
          color={Colors.whiteControl}
        />
        <Text style={styles.btnLabel} numberOfLines={1}>
          {Strings.lblInfo}
        </Text>
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onSharePress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="share-variant-outline"
          size={24}
          color={Colors.whiteControl}
        />
        <Text style={styles.btnLabel} numberOfLines={1}>
          {Strings.lblShare}
        </Text>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={onOpenSettings}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="cog-outline"
          size={24}
          color={Colors.whiteControl}
        />
        <Text style={styles.btnLabel} numberOfLines={1}>
          {Strings.lblSettings}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  btnLabel: {
    ...Typography.labelSmall,
    color: Colors.whiteControl,
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

