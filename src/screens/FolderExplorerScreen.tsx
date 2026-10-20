import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FolderItem, FolderSortOption } from '../types';
import { MediaDiagnostics, MediaService, PermissionLevel } from '../services/mediaService';
import { StorageService } from './../services/storage';
import { Colors, Spacing, Typography } from '../constants/theme';
import { Strings } from '../constants/strings';
import { FolderAppBar } from '../components/folder/FolderAppBar';
import { FolderItemRow } from '../components/folder/FolderItemRow';
import { FolderOptionsMenu } from '../components/folder/FolderOptionsMenu';
import { FolderSortModal } from '../components/folder/FolderSortModal';

interface FolderExplorerScreenProps {
  onSelectFolder: (folder: FolderItem) => void;
}

export const FolderExplorerScreen: React.FC<FolderExplorerScreenProps> = ({
  onSelectFolder,
}) => {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<FolderSortOption>('date_desc');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedFolderForMenu, setSelectedFolderForMenu] = useState<FolderItem | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('denied');
  const [diagnostics, setDiagnostics] = useState<MediaDiagnostics | null>(null);

  const loadFolders = useCallback(async (
    sort: FolderSortOption,
    pinnedOnly: boolean,
    force: boolean
  ) => {
    const { folders: data, diagnostics: diag } = await MediaService.getFolders(sort, pinnedOnly, force);
    setFolders(data);
    setDiagnostics(diag);
    setPermissionLevel(diag.permissionLevel);
  }, []);

  const refreshFolders = useCallback(async (
    sort: FolderSortOption = sortOption,
    pinnedOnly: boolean = showPinnedOnly,
    force: boolean = false
  ) => {
    setRefreshing(true);
    try {
      await loadFolders(sort, pinnedOnly, force);
    } catch (e) {
      console.warn('[REVID] refreshFolders error:', e);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [sortOption, showPinnedOnly, loadFolders]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    const prefs = await StorageService.getPreferences();
    setSortOption(prefs.folderSort);
    setShowPinnedOnly(prefs.showPinnedOnly);
    await refreshFolders(prefs.folderSort, prefs.showPinnedOnly, true);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSortSelect = async (option: FolderSortOption) => {
    setSortOption(option);
    await StorageService.savePreferences({ folderSort: option });
    await refreshFolders(option, showPinnedOnly);
  };

  const handleTogglePinnedOnly = async () => {
    const pinnedCount = folders.filter((f) => f.isPinned).length;
    if (!showPinnedOnly && pinnedCount === 0) {
      Alert.alert('Notice', Strings.msgNoPinned);
      return;
    }
    const next = !showPinnedOnly;
    setShowPinnedOnly(next);
    await StorageService.savePreferences({ showPinnedOnly: next });
    await refreshFolders(sortOption, next);
  };

  const handleTogglePin = async (folder: FolderItem) => {
    const isNowPinned = !folder.isPinned;
    MediaService.toggleFolderPinInCache(folder.id, folder.path);
    await StorageService.togglePinFolder(folder.id, folder.path);

    setFolders((prev) => {
      const updated = prev.map((f) => {
        if (f.id === folder.id || f.path === folder.path) {
          return { ...f, isPinned: isNowPinned, pinOrder: isNowPinned ? 0 : -1 };
        }
        return f;
      });
      return MediaService._sortFolders(updated, sortOption, showPinnedOnly);
    });
  };

  const handleOpenSettings = () => {
    MediaService.openAppSettings();
  };

  const handleRetryAfterSettings = async () => {
    MediaService.clearCache();
    setIsLoading(true);
    await refreshFolders(sortOption, showPinnedOnly, true);
  };

  useEffect(() => {
    const onBackPress = () => {
      if (sortModalVisible) {
        setSortModalVisible(false);
        return true;
      }
      if (selectedFolderForMenu !== null) {
        setSelectedFolderForMenu(null);
        return true;
      }
      if (isSearching) {
        setIsSearching(false);
        setSearchQuery('');
        return true;
      }
      return false; // let App.tsx handle app exit
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [sortModalVisible, selectedFolderForMenu, isSearching]);

  const displayedFolders = folders.filter((f) => {
    if (!isSearching || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
  });

  // ── Render: Full-screen loading ───────────────────────────
  if (isLoading) {
    return (
      <View style={styles.container}>
        <FolderAppBar
          isSearching={false}
          searchQuery=""
          showPinnedOnly={showPinnedOnly}
          onSearchQueryChange={() => {}}
          onStartSearch={() => {}}
          onCloseSearch={() => {}}
          onOpenSort={() => {}}
          onTogglePinnedOnly={() => {}}
        />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingTitle}>Scanning video folders…</Text>
          <Text style={styles.loadingSubtitle}>This may take a moment</Text>
        </View>
      </View>
    );
  }

  // ── Render: Permission denied ─────────────────────────────
  if (permissionLevel === 'denied') {
    return (
      <View style={styles.container}>
        <FolderAppBar
          isSearching={false}
          searchQuery=""
          showPinnedOnly={showPinnedOnly}
          onSearchQueryChange={() => {}}
          onStartSearch={() => {}}
          onCloseSearch={() => {}}
          onOpenSort={() => {}}
          onTogglePinnedOnly={() => {}}
        />
        <View style={styles.centeredContainer}>
          <View style={styles.statusIconCircle}>
            <MaterialCommunityIcons name="lock-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.statusTitle}>Storage Permission Required</Text>
          <Text style={styles.statusSubtitle}>
            REVID needs permission to access your videos.{'\n'}
            Tap below to grant access in Settings.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenSettings} activeOpacity={0.8}>
            <MaterialCommunityIcons name="cog-outline" size={18} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Open App Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRetryAfterSettings} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>I Granted — Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Render: Limited (partial) permission ──────────────────
  if (permissionLevel === 'limited' && folders.length === 0) {
    return (
      <View style={styles.container}>
        <FolderAppBar
          isSearching={false}
          searchQuery=""
          showPinnedOnly={showPinnedOnly}
          onSearchQueryChange={() => {}}
          onStartSearch={() => {}}
          onCloseSearch={() => {}}
          onOpenSort={() => {}}
          onTogglePinnedOnly={() => {}}
        />
        <View style={styles.centeredContainer}>
          <View style={styles.statusIconCircle}>
            <MaterialCommunityIcons name="shield-alert-outline" size={40} color={Colors.warning} />
          </View>
          <Text style={styles.statusTitle}>Limited Access</Text>
          <Text style={styles.statusSubtitle}>
            You granted REVID access to only selected photos.{'\n\n'}
            To see ALL your video folders, open Settings and change the permission to{' '}
            <Text style={{ color: Colors.primary, fontWeight: '700' }}>"Allow all"</Text>.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenSettings} activeOpacity={0.8}>
            <MaterialCommunityIcons name="cog-outline" size={18} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Open App Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRetryAfterSettings} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>I Changed It — Refresh</Text>
          </TouchableOpacity>
          {/* Diagnostic Info */}
          {diagnostics && (
            <View style={styles.diagCard}>
              <Text style={styles.diagText}>Android SDK: {diagnostics.androidSdk}</Text>
              <Text style={styles.diagText}>Albums found: {diagnostics.albumsFound}</Text>
              <Text style={styles.diagText}>Video folders: {diagnostics.foldersWithVideos}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ── Render: Full permission but 0 results ─────────────────
  if (folders.length === 0 && !refreshing) {
    return (
      <View style={styles.container}>
        <FolderAppBar
          isSearching={isSearching}
          searchQuery={searchQuery}
          showPinnedOnly={showPinnedOnly}
          onSearchQueryChange={setSearchQuery}
          onStartSearch={() => setIsSearching(true)}
          onCloseSearch={() => { setIsSearching(false); setSearchQuery(''); }}
          onOpenSort={() => setSortModalVisible(true)}
          onTogglePinnedOnly={handleTogglePinnedOnly}
        />
        <View style={styles.centeredContainer}>
          <View style={styles.statusIconCircle}>
            <MaterialCommunityIcons name="folder-alert-outline" size={40} color={Colors.textTertiary} />
          </View>
          <Text style={styles.statusTitle}>No Video Folders Found</Text>
          <Text style={styles.statusSubtitle}>
            Permission is granted but no videos were detected.{'\n'}
            Try pulling down to refresh.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => refreshFolders(sortOption, showPinnedOnly, true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="refresh" size={18} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Refresh Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenSettings} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Check App Permissions</Text>
          </TouchableOpacity>
          {/* Diagnostic card */}
          {diagnostics && (
            <View style={styles.diagCard}>
              <Text style={styles.diagTitle}>Diagnostic Info</Text>
              <Text style={styles.diagText}>Permission: {diagnostics.permissionLevel}</Text>
              <Text style={styles.diagText}>Android SDK: {diagnostics.androidSdk}</Text>
              <Text style={styles.diagText}>Albums found: {diagnostics.albumsFound}</Text>
              <Text style={styles.diagText}>Video assets: {diagnostics.videoAssetsFound}</Text>
              <Text style={styles.diagText}>Folders w/ videos: {diagnostics.foldersWithVideos}</Text>
              {diagnostics.errorMessage && (
                <Text style={[styles.diagText, { color: Colors.error }]}>Error: {diagnostics.errorMessage}</Text>
              )}
            </View>
          )}
        </View>
        <FolderSortModal
          visible={sortModalVisible}
          selectedOption={sortOption}
          onSelect={handleSortSelect}
          onClose={() => setSortModalVisible(false)}
        />
      </View>
    );
  }

  // ── Render: Normal folder list ────────────────────────────
  return (
    <View style={styles.container}>
      <FolderAppBar
        isSearching={isSearching}
        searchQuery={searchQuery}
        showPinnedOnly={showPinnedOnly}
        onSearchQueryChange={setSearchQuery}
        onStartSearch={() => setIsSearching(true)}
        onCloseSearch={() => { setIsSearching(false); setSearchQuery(''); }}
        onOpenSort={() => setSortModalVisible(true)}
        onTogglePinnedOnly={handleTogglePinnedOnly}
      />

      {/* Limited access warning banner */}
      {permissionLevel === 'limited' && (
        <TouchableOpacity style={styles.limitedBanner} onPress={handleOpenSettings} activeOpacity={0.8}>
          <MaterialCommunityIcons name="shield-alert-outline" size={16} color={Colors.warning} />
          <Text style={styles.limitedBannerText}>
            Limited access — tap to grant full access in Settings
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={displayedFolders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FolderItemRow
            folder={item}
            onPress={onSelectFolder}
            onOptionsPress={(f) => setSelectedFolderForMenu(f)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refreshFolders(sortOption, showPinnedOnly, true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          !refreshing ? (
            <View style={styles.centeredContainer}>
              <MaterialCommunityIcons name="pin-off-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.statusTitle}>No pinned folders</Text>
            </View>
          ) : undefined
        }
        contentContainerStyle={displayedFolders.length === 0 ? styles.emptyContainer : styles.listContent}
      />

      <FolderSortModal
        visible={sortModalVisible}
        selectedOption={sortOption}
        onSelect={handleSortSelect}
        onClose={() => setSortModalVisible(false)}
      />

      <FolderOptionsMenu
        visible={selectedFolderForMenu !== null}
        folder={selectedFolderForMenu}
        onClose={() => setSelectedFolderForMenu(null)}
        onTogglePin={handleTogglePin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { paddingBottom: Spacing.xxl },
  emptyContainer: { flexGrow: 1 },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  statusIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  loadingTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    color: Colors.text,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  loadingSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  statusTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statusSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    maxWidth: 300,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.black,
  },
  secondaryButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  diagCard: {
    marginTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diagTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  diagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  limitedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 77, 0.10)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 183, 77, 0.20)',
  },
  limitedBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.warning,
    fontWeight: '500',
  },
});
