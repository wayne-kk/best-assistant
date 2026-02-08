import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from '../types/navigation';
import { Icon } from '../components/Icon';
import { SafeScreen } from '../components/SafeScreen';
import { useTaskStore } from '../store/taskStore';

type PlanNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Plan'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** 今日计划项（占位：按时间展示，点击跳转任务） */
const MOCK_PLAN_ITEMS = [
  { time: '09:00', label: '架构方案', duration: '30min', taskId: null as string | null },
  { time: '14:00', label: '与 AI 复盘需求', duration: '', taskId: null },
  { time: '19:00', label: '阅读 & 总结', duration: '', taskId: null },
];

export function PlanScreen({ navigation }: { navigation: PlanNav }) {
  const { getActiveTask, tasks } = useTaskStore();
  const focusTask = getActiveTask();

  const itemsWithTask = MOCK_PLAN_ITEMS.map((item, i) => ({
    ...item,
    taskId: tasks[i]?.id ?? item.taskId,
  }));

  return (
    <SafeScreen>
      <View className="flex-1 bg-surface">
      <View className="px-4 pt-2 pb-2">
        <Text className="text-2xl font-semibold text-text-primary">今天</Text>
        {focusTask ? (
          <Text className="text-muted text-sm mt-1">当前聚焦：{focusTask.title}</Text>
        ) : null}
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {itemsWithTask.map((item, index) => (
          <Pressable
            key={`${item.time}-${index}`}
            onPress={() => item.taskId && navigation.navigate('TaskDetail', { taskId: item.taskId })}
            className="flex-row items-center py-4 border-b border-border"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Text className="text-muted w-14 text-sm">{item.time}</Text>
            <View className="flex-1">
              <Text className="text-text-primary font-medium">{item.label}</Text>
              {item.duration ? (
                <Text className="text-muted text-xs mt-0.5">{item.duration}</Text>
              ) : null}
            </View>
            {item.taskId ? <Icon name="chevron-forward" size={18} color="#1677ff" /> : null}
          </Pressable>
        ))}
        <Text className="text-muted text-center text-sm py-8">
          计划页：后续可接入日历与任务时间绑定
        </Text>
      </ScrollView>
      </View>
    </SafeScreen>
  );
}
