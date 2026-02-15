import React, { memo } from 'react';
import { View, Text } from 'react-native';
import Card from './ui/Card';
import { theme, colorFromString } from './theme';

interface Song {
  id: string;
  title?: string;
  composer?: any;
  categories?: string[];
  updatedAt?: string | number | Date;
}

interface Props {
  song: Song;
  onPress?: () => void;
}

function SongCardBase({ song, onPress }: Props) {
  const title = song?.title?.trim?.() || 'Untitled';
  const rawComposer = song?.composer;
  const composer =
    typeof rawComposer === 'string' && rawComposer.trim().length > 0
      ? rawComposer
      : 'Unknown Composer';

  const leading = (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colorFromString(title),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: 'white', fontWeight: '800' }}>
        {(title?.[0] ?? '♪').toUpperCase()}
      </Text>
    </View>
  );

  const meta = (
    <View style={{ marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {(song?.categories ?? []).slice(0, 3).map((c) => (
        <View
          key={c}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{c}</Text>
        </View>
      ))}
      {song?.updatedAt ? (
        <Text style={{ marginLeft: 'auto', color: theme.colors.muted, fontSize: 12 }}>
          Updated {new Date(song.updatedAt).toLocaleDateString()}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Card title={title} subtitle={composer} leading={leading} meta={meta} onPress={onPress} />
  );
}

const SongCard = memo(SongCardBase);
export default SongCard;
