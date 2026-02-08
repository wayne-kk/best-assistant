import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { TaskPlan } from '../../types/task';
import { StepItem } from '../StepItem';

const statusLabel: Record<TaskPlan['status'], string> = {
  planning: '规划中',
  active: '进行中',
  completed: '已完成',
};

const statusClass: Record<TaskPlan['status'], string> = {
  planning: 'bg-muted/30',
  active: 'bg-accent/20',
  completed: 'bg-success/20',
};

type Props = {
  task: TaskPlan;
  onPress?: () => void;
  compact?: boolean;
};

export function TaskCard({ task, onPress, compact = false }: Props) {
  const content = (
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
      <View className="flex-row justify-between items-center gap-3">
        <Text className="text-lg font-semibold text-text-primary flex-1" numberOfLines={1}>
          {task.title}
        </Text>
        <View className={`px-2.5 py-1 rounded-lg ${statusClass[task.status]}`}>
          <Text
            className={`text-xs font-medium ${
              task.status === 'active' ? 'text-accent' : task.status === 'completed' ? 'text-success' : 'text-muted'
            }`}
          >
            {statusLabel[task.status]}
          </Text>
        </View>
      </View>
      {task.goal ? (
        <Text className="text-sm text-text-secondary mt-2 leading-5" numberOfLines={2}>
          {task.goal}
        </Text>
      ) : null}
      {!compact && task.steps.length > 0 && (
        <View className="mt-3 pt-3 border-t border-border">
          {task.steps.slice(0, 4).map((step, i) => (
            <StepItem key={step.id} step={step} index={i} />
          ))}
          {task.steps.length > 4 && (
            <Text className="text-xs text-muted mt-1">共 {task.steps.length} 步</Text>
          )}
        </View>
      )}
      {compact && onPress && (
        <Text className="text-xs text-muted mt-2">点击查看步骤 →</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="mb-0"
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        {content}
      </Pressable>
    );
  }
  return <View className="mb-0">{content}</View>;
}
