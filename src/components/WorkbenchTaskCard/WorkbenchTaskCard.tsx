import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { TaskPlan } from '../../types/task';

const dotColors: Record<string, string> = {
  running: '#722ed1',
  waiting: '#faad14',
  background: '#1677ff',
  paused: '#8c8c8c',
};

function getDotColor(task: TaskPlan, isFocused: boolean): string {
  if (task.runState === 'paused') return dotColors.paused;
  if (!isFocused) return dotColors.background;
  const p = task.progress ?? 0;
  const label = task.statusLabel ?? '';
  if (label.includes('等待') || (p === 0 && task.status === 'active')) return dotColors.waiting;
  return dotColors.running;
}

type Props = {
  task: TaskPlan;
  isFocused: boolean;
  onPress: () => void;
  onContinue?: () => void;
  onPause?: () => void;
  onReview?: () => void;
};

export function WorkbenchTaskCard({
  task,
  isFocused,
  onPress,
  onContinue,
  onPause,
  onReview,
}: Props) {
  const dotColor = getDotColor(task, isFocused);
  const progress = task.progress ?? 0;
  const showProgress = progress > 0 && progress < 100 && task.runState !== 'paused';

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 active:opacity-95"
      style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
    >
      <View
        className="bg-surface-elevated rounded-card p-4 border border-border"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-2 mb-1">
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: dotColor,
            }}
          />
          <Text className="text-base font-semibold text-text-primary flex-1" numberOfLines={1}>
            {task.title}
          </Text>
        </View>
        {task.statusLabel ? (
          <Text className="text-sm text-text-secondary mb-2" numberOfLines={1}>
            {task.statusLabel}
          </Text>
        ) : null}
        {showProgress ? (
          <View className="h-1.5 bg-border rounded-full overflow-hidden mb-3">
            <View
              className="h-full rounded-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </View>
        ) : null}
        <View className="flex-row gap-2">
          {task.runState === 'paused' && onContinue ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onContinue();
              }}
              className="px-3 py-1.5 rounded-lg bg-accent"
            >
              <Text className="text-white text-xs font-medium">继续</Text>
            </Pressable>
          ) : null}
          {task.runState === 'active' && onPause ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onPause();
              }}
              className="px-3 py-1.5 rounded-lg border border-border"
            >
              <Text className="text-text-secondary text-xs font-medium">暂停</Text>
            </Pressable>
          ) : null}
          {onReview ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onReview();
              }}
              className="px-3 py-1.5 rounded-lg border border-border"
            >
              <Text className="text-text-secondary text-xs font-medium">复盘</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
