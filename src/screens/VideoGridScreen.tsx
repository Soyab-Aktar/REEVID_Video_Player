import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { FolderItem, VideoInfo, VideoItem, VideoSortOption } from '../types';
import { MediaService } from '../services/mediaService';
import { StorageService } from '../services/storage';
import { Colors } from '../constants/theme';
import { Strings } from '../constants/strings';
import { VideoListAppBar } from '../components/videoList/VideoListAppBar';
import { VideoThumbnailCard } from '../components/videoList/VideoThumbnailCard';
import { VideoSortModal } from '../components/videoList/VideoSortModal';
import { VideoInfoModal } from '../components/videoList/VideoInfoModal';
import { DeleteConfirmModal } from '../components/videoList/DeleteConfirmModal';
import { EmptyState } from '../components/common/EmptyState';

interface VideoGridScreenProps {
  folder: FolderItem;
  onBack: () => void;
  onPlayVideo: (video: VideoItem, initialIndex: number, playlist: VideoItem[]) => void;
}

export const VideoGridScreen: React.FC<VideoGridScreenProps> = ({
  folder,
  onBack,
  onPlayVideo,
}) => {
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 3 : 2;

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<VideoSortOption>('date_desc');

  // Multi-Selection Mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedVideoForInfo, setSelectedVideoForInfo] = useState<VideoInfo | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const loadVideos = useCallback(
    async (currentSort: VideoSortOption) => {
      setRefreshing(true);
      try {
        const data = await MediaService.getVideosInFolder(folder.path, currentSort);
        setVideos(data);
      } catch (e) {
        console.warn('Failed to load videos for folder', e);
      } finally {
        setRefreshing(false);
      }
    },
    [folder.path]
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setRefreshing(true);
      try {
        const prefs = await StorageService.getPreferences();
        const preferredSort = prefs.videoSort || 'date_desc';
        if (!isMounted) return;
        setSortOption(preferredSort);
        const data = await MediaService.getVideosInFolder(folder.path, preferredSort);
        if (isMounted) {
          setVideos(data);
        }
      } catch (e) {
        console.warn('Failed to load videos for folder', e);
      } finally {
        if (isMounted) {
          setRefreshing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [folder.path]);

  // Sort Selection - immediately re-sorts in memory and persists preference
  const handleSortSelect = async (option: VideoSortOption) => {
    setSortOption(option);
    await StorageService.savePreferences({ videoSort: option });
    setVideos((prev) => MediaService.sortVideos(prev, option));
  };

  // Selection Mode Handlers
  const handleToggleSelectVideo = (videoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === videos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(videos.map((v) => v.id)));
    }
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  useEffect(() => {
    const onBackPress = () => {
      if (sortModalVisible) {
        setSortModalVisible(false);
        return true;
      }
      if (infoModalVisible) {
        setInfoModalVisible(false);
        return true;
      }
      if (deleteModalVisible) {
        setDeleteModalVisible(false);
        return true;
      }
      if (isSelectionMode) {
        handleExitSelection();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isSelectionMode, sortModalVisible, infoModalVisible, deleteModalVisible]);

  const handleEnterSelectionWithVideo = (videoId: string) => {
    setIsSelectionMode(true);
    setSelectedIds(new Set([videoId]));
  };

  // Video Info Handler (exactly 1 item selected)
  const handleOpenInfo = () => {
    const selectedId = Array.from(selectedIds)[0];
    const targetVideo = videos.find((v) => v.id === selectedId);
    if (targetVideo) {
      const info = MediaService.getVideoInfo(targetVideo);
      setSelectedVideoForInfo(info);
      setInfoModalVisible(true);
    }
  };

  // Delete Handlers
  const handleConfirmDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    setDeleteModalVisible(false);
    await MediaService.deleteVideos(idsToDelete);
    handleExitSelection();
    await loadVideos(sortOption);
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <VideoListAppBar
        folderName={folder.name}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedIds.size}
        totalCount={videos.length}
        allSelected={videos.length > 0 && selectedIds.size === videos.length}
        onBackPress={onBack}
        onExitSelection={handleExitSelection}
        onOpenSort={() => setSortModalVisible(true)}
        onEnterSelection={() => setIsSelectionMode(true)}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenInfo={handleOpenInfo}
        onDeleteSelected={() => setDeleteModalVisible(true)}
      />

      {/* Video Grid */}
      <FlatList
        key={`grid-${numColumns}`}
        data={videos}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item, index }) => (
          <VideoThumbnailCard
            video={item}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.has(item.id)}
            onPress={() => {
              if (isSelectionMode) {
                handleToggleSelectVideo(item.id);
              } else {
                onPlayVideo(item, index, videos);
              }
            }}
            onLongPress={() => {
              if (!isSelectionMode) {
                handleEnterSelectionWithVideo(item.id);
              }
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadVideos(sortOption)}
            tintColor={Colors.primary}
            colors={[Colors.primary, Colors.accent]}
          />
        }
        ListEmptyComponent={
          !refreshing ? (
            <EmptyState
              icon="filmstrip-off"
              title={Strings.msgNoItemFound}
              subtitle="This folder does not contain any compatible video files."
            />
          ) : undefined
        }
        contentContainerStyle={
          videos.length === 0 ? styles.emptyContainer : styles.listContent
        }
      />

      {/* Sort Modal */}
      <VideoSortModal
        visible={sortModalVisible}
        selectedOption={sortOption}
        onSelect={handleSortSelect}
        onClose={() => setSortModalVisible(false)}
      />

      {/* Video Info Modal */}
      <VideoInfoModal
        visible={infoModalVisible}
        videoInfo={selectedVideoForInfo}
        onClose={() => {
          setInfoModalVisible(false);
          setSelectedVideoForInfo(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        count={selectedIds.size}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 4,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
