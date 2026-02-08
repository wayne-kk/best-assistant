import React from 'react';
import { View, Text } from 'react-native';
import type { TaskStep } from '../../types/task';

const statusCircleClass: Record<TaskStep['status'], string> = {
  todo: 'bg-card border-2 border-border',
  doing: 'bg-accent/20 border-2 border-accent',
  done: 'bg-success/20 border-2 border-success/50',
};

const statusLabel: Record<TaskStep['status'], string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
};

type Props = {
  step: TaskStep;
  index: number;
};

export function StepItem({ step, index }: Props) {
  const isDone = step.status === 'done';
  const isDoing = step.status === 'doing';

  return (
    <View className="flex-row items-start mb-4">
      <View
        className={`w-9 h-9 rounded-full justify-center items-center ${statusCircleClass[step.status]}`}
      >
        <Text
          className={`text-sm font-semibold ${
            isDone ? 'text-success' : isDoing ? 'text-accent' : 'text-muted'
          }`}
        >
          {isDone ? '✓' : index + 1}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={`text-[15px] font-medium leading-5 ${
            isDone ? 'text-muted line-through' : 'text-text-primary'
          }`}
        >
          {step.title}
        </Text>
        {step.description ? (
          <Text className="text-sm text-muted mt-1 leading-5">{step.description}</Text>
        ) : null}
        <Text className="text-xs text-muted mt-1.5">{statusLabel[step.status]}</Text>
      </View>
    </View>
  );
}
