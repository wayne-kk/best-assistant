import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTaskStore } from '../store/taskStore';
import { StepItem } from '../components/StepItem';
import { TaskCard } from '../components/TaskCard';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const { tasks, getActiveTask, advanceCurrentStep, persist } = useTaskStore();
  const task = tasks.find((t) => t.id === taskId);
  const isActiveTask = getActiveTask()?.id === taskId;
  const currentStep = isActiveTask ? useTaskStore.getState().getCurrentStep() : null;
  const canCompleteStep = currentStep && currentStep.status === 'doing';

  useEffect(() => {
    useTaskStore.getState().loadFromStorage();
  }, []);

  if (!task) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <Text className="text-muted">任务不存在</Text>
      </View>
    );
  }

  const currentDoing = task.steps.find((s) => s.status === 'doing');
  const allDone = task.steps.every((s) => s.status === 'done');

  return (
    <View className="flex-1 bg-surface">
      <View className="px-4 pt-4 pb-4 border-b border-border bg-surface-elevated">
        <Text className="text-xl font-semibold text-text-primary" numberOfLines={2}>
          任务：{task.title}
        </Text>
        {task.goal ? (
          <Text className="text-sm text-muted mt-2 leading-5" numberOfLines={2}>
            {task.goal}
          </Text>
        ) : null}
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <TaskCard task={task} compact />
        </View>
        <Text className="text-sm font-medium text-muted mb-3">步骤</Text>
        <View className="bg-surface-elevated rounded-card border border-border p-4 mb-4">
          {task.steps.map((step, i) => (
            <StepItem key={step.id} step={step} index={i} />
          ))}
        </View>

        {allDone && (
          <View
            className="p-5 rounded-card border border-success/30"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)' }}
          >
            <Text className="text-success font-semibold text-center text-base">
              🎉 该任务已全部完成
            </Text>
            <Text className="text-muted text-sm text-center mt-2">
              如果有新目标，可以回到对话里继续。
            </Text>
          </View>
        )}

        {currentDoing && !allDone && (
          <View className="mt-2">
            <View
              className="p-4 rounded-card border border-accent/30 mb-3 bg-accent-soft"
            >
              <Text className="text-xs text-muted mb-1">当前步骤</Text>
              <Text className="text-text-primary font-medium">{currentDoing.title}</Text>
            </View>
            {canCompleteStep && (
              <Pressable
                className="bg-accent py-4 rounded-card active:opacity-90"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: '#1677ff',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                })}
                onPress={() => {
                  const result = advanceCurrentStep();
                  void persist();
                  if (result?.completed) {
                    navigation.goBack();
                  }
                }}
              >
                <Text className="text-white font-semibold text-center text-[15px]">
                  完成本步，进入下一步
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface-elevated px-4 pt-2 pb-6">
        <View className="flex-row flex-wrap gap-2 mb-2">
          <Pressable className="px-3 py-1.5 rounded-lg border border-border">
            <Text className="text-text-secondary text-sm">+ 技能</Text>
          </Pressable>
          <Pressable className="px-3 py-1.5 rounded-lg border border-border">
            <Text className="text-text-secondary text-sm">+ 文件</Text>
          </Pressable>
          <Pressable className="px-3 py-1.5 rounded-lg border border-border">
            <Text className="text-text-secondary text-sm">+ 上下文</Text>
          </Pressable>
        </View>
        <TextInput
          className="bg-surface border border-border rounded-input px-4 py-3 text-[15px] text-text-primary"
          placeholder="继续优化缓存和并发策略…"
          placeholderTextColor="#8c8c8c"
          editable={false}
        />
      </View>
    </View>
  );
}
