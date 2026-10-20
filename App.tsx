import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FolderExplorerScreen } from './src/screens/FolderExplorerScreen';
import { VideoGridScreen } from './src/screens/VideoGridScreen';
import { VerticalPlayerScreen } from './src/screens/VerticalPlayerScreen';
import { FolderItem, VideoItem } from './src/types';
import { Colors } from './src/constants/theme';

export default function App() {
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<VideoItem[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const onBackPress = () => {
      if (isPlaying) {
        setIsPlaying(false);
        return true;
      }
      if (currentFolder !== null) {
        setCurrentFolder(null);
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isPlaying, currentFolder]);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />

        {isPlaying && activePlaylist.length > 0 ? (
          <VerticalPlayerScreen
            playlist={activePlaylist}
            initialIndex={activeVideoIndex}
            onBack={() => setIsPlaying(false)}
            onVideoDeleted={(deletedId) => {
              setActivePlaylist((prev) => prev.filter((v) => v.id !== deletedId));
            }}
          />
        ) : currentFolder !== null ? (
          <VideoGridScreen
            folder={currentFolder}
            onBack={() => setCurrentFolder(null)}
            onPlayVideo={(video, index, playlist) => {
              setActivePlaylist(playlist);
              setActiveVideoIndex(index);
              setIsPlaying(true);
            }}
          />
        ) : (
          <FolderExplorerScreen
            onSelectFolder={(folder) => {
              setCurrentFolder(folder);
            }}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
});
