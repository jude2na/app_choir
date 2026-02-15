import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { loadSongs } from '../../utils/storage';

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [song, setSong] = useState<any>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);

  useEffect(() => {
    (async () => {
      const all = await loadSongs();
      const found = all.find((s) => s.id === id);
      setSong(found || null);
    })();
  }, [id]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const hasAudio = !!song?.audioFile?.uri;
  const progress = useMemo(() => {
    if (!durationMillis) return 0;
    return Math.min(1, Math.max(0, positionMillis / durationMillis));
  }, [positionMillis, durationMillis]);

  const loadAndPlay = async () => {
    if (!hasAudio) return;
    try {
      if (!soundRef.current) {
        const { sound, status } = await Audio.Sound.createAsync(
          { uri: song.audioFile.uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setIsPlaying(true);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Audio play error', e);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status) return;
    if ('positionMillis' in status) setPositionMillis(status.positionMillis || 0);
    if ('durationMillis' in status) setDurationMillis(status.durationMillis || 0);
    if ('isPlaying' in status) setIsPlaying(status.isPlaying || false);
  };

  const pause = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const seekBy = async (deltaMs: number) => {
    if (!soundRef.current) return;
    const newPos = Math.max(0, Math.min((durationMillis || 0), positionMillis + deltaMs));
    await soundRef.current.setPositionAsync(newPos);
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor((ms || 0) / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const composer = useMemo(() => {
    const raw = song?.composer;
    if (typeof raw === 'string' && raw.trim().length > 0) return raw;
    return 'Unknown Composer';
  }, [song]);

  // Split lyrics into verses by blank lines
  const verses: string[] = useMemo(() => {
    const raw = song?.lyrics || '';
    return raw.split(/\n\s*\n+/).map((v: string) => v.trim()).filter(Boolean);
  }, [song?.lyrics]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{song?.title || 'Untitled'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Audio controls */}
        {hasAudio ? (
          <View style={styles.audioCard}>
            <View style={styles.audioRow}>
              <TouchableOpacity onPress={() => seekBy(-10000)} style={styles.audioBtn}>
                <RotateCcw size={18} color="#FFFFFF" />
              </TouchableOpacity>
              {isPlaying ? (
                <TouchableOpacity onPress={pause} style={[styles.audioBtn, styles.playBtn]}>
                  <Pause size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={loadAndPlay} style={[styles.audioBtn, styles.playBtn]}>
                  <Play size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => seekBy(10000)} style={styles.audioBtn}>
                <RotateCw size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.timeText}>
              {formatTime(positionMillis)} / {formatTime(durationMillis)}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        ) : null}

        {/* Metadata */}
        <View style={styles.meta}>
          <Text style={styles.metaTitle}>{song?.title || 'Untitled'}</Text>
          <Text style={styles.metaSubtitle}>{composer}</Text>
        </View>

        {/* Lyrics - verse sections */}
        {verses.length > 0 ? (
          <View style={{ gap: 12 }}>
            {verses.map((v, idx) => (
              <LinearGradient
                key={idx}
                colors={idx % 2 === 0 ? ['#1A1F2B', '#141821'] : ['#141821', '#1A1F2B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.verseCard}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={styles.verseLabel}>Verse {idx + 1}</Text>
                </View>
                <Text style={styles.lyricsText}>{v}</Text>
              </LinearGradient>
            ))}
          </View>
        ) : (
          <View style={styles.lyricsCard}>
            <Text style={styles.lyricsText}>{song?.lyrics || 'No lyrics provided.'}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F14' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#EAEAF0', maxWidth: '70%' },
  content: { padding: 16, paddingBottom: 40 },
  audioCard: {
    backgroundColor: '#141821', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#202533',
  },
  progressBar: { height: 6, backgroundColor: '#202533', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: 6, backgroundColor: '#6C5CE7' },
  audioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  audioBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1A1F2B', alignItems: 'center', justifyContent: 'center' },
  playBtn: { backgroundColor: '#6C5CE7' },
  timeText: { color: '#9AA0A6', fontSize: 12, marginTop: 8, textAlign: 'center' },
  meta: { marginBottom: 12 },
  metaTitle: { fontSize: 22, fontWeight: '800', color: '#EAEAF0', marginBottom: 4 },
  metaSubtitle: { fontSize: 14, color: '#9AA0A6' },
  lyricsCard: { backgroundColor: '#141821', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#202533' },
  verseCard: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#202533' },
  verseLabel: { color: '#00D2D3', fontWeight: '700', letterSpacing: 0.5 },
  lyricsText: { color: '#EAEAF0', fontSize: 16, lineHeight: 24 },
});
