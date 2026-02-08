import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from '../Icon';
import type { TaskPlan } from '../../types/task';

type Props = {
  task: TaskPlan | null;
  onPress: () => void;
};

export function StickyFocusBar({ task, onPress }: Props) {
  if (!task) {
    return (
      <Pressable
        onPress={onPress}
        className="mx-4 mt-2 mb-1 py-3 px-4 rounded-card border border-dashed border-border bg-surface-elevated"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Icon name="bulb-outline" size={16} color="#8c8c8c" />
            <Text className="text-muted text-sm">点击选择或新建任务</Text>
          </View>
          <Icon name="chevron-forward" size={16} color="#8c8c8c" />
        </View>
      </Pressable>
    );
  }

  const isPaused = task.runState === 'paused';

  return (
    <Pressable
      onPress={onPress}
      className="mx-4 mt-2 mb-1 py-3 px-4 rounded-card bg-surface-elevated border border-border"
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-1 mb-0.5">
            <Icon name="bulb-outline" size={12} color="#8c8c8c" />
            <Text className="text-xs text-muted">当前聚焦</Text>
          </View>
          <Text className="text-base font-semibold text-text-primary" numberOfLines={1}>
            {task.title}
          </Text>
        </View>
        {isPaused ? (
          <Icon name="pause" size={18} color="#8c8c8c" />
        ) : (
          <Icon name="chevron-forward" size={18} color="#8c8c8c" />
        )}
      </View>
    </Pressable>
  );
}
