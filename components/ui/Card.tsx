import React from 'react';
import { Pressable, View, Text, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  title?: string;
  subtitle?: string | React.ReactNode;
  meta?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

export default function Card({ title, subtitle, meta, leading, trailing, onPress, onLongPress, style }: CardProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          padding: theme.spacing(2),
          opacity: pressed ? 0.92 : 1,
          marginBottom: theme.spacing(1.5),
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadow.md,
        },
        style as any,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {leading ? <View style={{ marginRight: theme.spacing(1.5) }}>{leading}</View> : null}
        <View style={{ flex: 1 }}>
          {title ? (
            <Text
              style={[theme.typography.title, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            typeof subtitle === 'string' ? (
              <Text style={[theme.typography.subtitle]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )
          ) : null}
          {meta}
        </View>
        {trailing}
      </View>
    </Pressable>
  );
}
