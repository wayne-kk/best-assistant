import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from '../types/navigation';
import type { MainTabParamList } from '../types/navigation';
import { useTaskStore } from '../store/taskStore';
import { SafeScreen } from '../components/SafeScreen';
import { Icon } from '../components/Icon';
import { StickyFocusBar } from '../components/StickyFocusBar';
import { WorkbenchTaskCard } from '../components/WorkbenchTaskCard';
import { TaskSwitchDrawer } from '../components/TaskSwitchDrawer';
import { NewTaskModal } from '../components/NewTaskModal';
import { getMockResponse, mockStreamReply } from '../services/mockAi';
import { useChatStore } from '../store/chatStore';
import type { TaskPlan } from '../types/task';

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = { navigation: HomeNav };

const MAX_CARDS = 7;

export function HomeScreen({ navigation }: Props) {
  const {
    getActiveTask,
    getActiveTasks,
    getPausedTasks,
    setCurrentTask,
    setTaskRunState,
    addTask,
    setTaskFromServer,
    setTaskProgress,
    persist,
    loadFromStorage,
  } = useTaskStore();
  const { addMessage, setStreamingContent, commitStreamingToMessage } = useChatStore();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [newTaskVisible, setNewTaskVisible] = useState(false);
  const streamBufferRef = useRef('');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const focusTask = getActiveTask();
  const activeTasks = getActiveTasks();
  const pausedTasks = getPausedTasks();
  const displayTasks = [...activeTasks, ...pausedTasks].slice(0, MAX_CARDS);

  const handleOpenDrawer = () => setDrawerVisible(true);
  const handleSelectTask = (taskId: string) => {
    setCurrentTask(taskId);
    setDrawerVisible(false);
  };
  const handlePauseTask = (taskId: string) => {
    setTaskRunState(taskId, 'paused');
    const { currentTaskId } = useTaskStore.getState();
    if (currentTaskId === taskId) {
      const next = activeTasks.find((t) => t.id !== taskId);
      useTaskStore.getState().setCurrentTask(next?.id ?? null);
    }
    useTaskStore.getState().persist();
  };
  const handleResumeTask = (taskId: string) => {
    setTaskRunState(taskId, 'active');
    setCurrentTask(taskId);
    useTaskStore.getState().persist();
    setDrawerVisible(false);
  };

  const handleNewTask = (userInput: string) => {
    const plan: Omit<TaskPlan, 'id' | 'createdAt'> = {
      title: userInput.slice(0, 30),
      goal: userInput,
      steps: [
        { id: 's1', title: '规划中', description: '', status: 'doing' },
      ],
      status: 'active',
      runState: 'active',
      progress: 0,
      statusLabel: 'AI：正在生成步骤…',
    };
    const task = addTask(plan);
    void persist();

    useChatStore.getState().addMessage('user', [{ type: 'text', value: userInput }]);
    useChatStore.getState().addMessage('assistant', []);
    useChatStore.setState({ isLoading: true });
    streamBufferRef.current = '';
    setStreamingContent('');

    const res = getMockResponse(userInput, task, task.steps[0]);
    const fullText = res.blocks
      .map((b) => (b.type === 'text' ? b.value : b.type === 'extra' ? b.value : ''))
      .filter(Boolean)
      .join('\n');
    mockStreamReply(
      fullText,
      (chunk) => {
        streamBufferRef.current += chunk;
        setStreamingContent(streamBufferRef.current);
      },
      () => {
        commitStreamingToMessage(res.blocks);
        setStreamingContent(null);
        useChatStore.setState({ isLoading: false });
        if (res.task) {
          useTaskStore.getState().setTaskFromServer(res.task);
          useTaskStore.getState().setTaskProgress(res.task.id, 100, '已完成');
          void useTaskStore.getState().persist();
        }
      },
      25
    );
    setNewTaskVisible(false);
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-surface">
        <StickyFocusBar task={focusTask} onPress={handleOpenDrawer} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {displayTasks.length === 0 ? (
          <View className="py-12 items-center">
            <Text className="text-muted text-center mb-2">暂无任务</Text>
            <Text className="text-text-secondary text-sm text-center">
              点击右下角新建任务
            </Text>
          </View>
        ) : (
          displayTasks.map((task) => (
            <WorkbenchTaskCard
              key={task.id}
              task={task}
              isFocused={task.id === focusTask?.id}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              onContinue={() => handleResumeTask(task.id)}
              onPause={() => handlePauseTask(task.id)}
              onReview={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            />
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => setNewTaskVisible(true)}
        className="absolute right-4 bottom-24 w-14 h-14 rounded-full bg-accent items-center justify-center"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <Icon name="add" size={28} color="#fff" />
      </Pressable>

      <TaskSwitchDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeTasks={activeTasks}
        pausedTasks={pausedTasks}
        currentTaskId={focusTask?.id ?? null}
        onSelectTask={handleSelectTask}
        onPauseTask={handlePauseTask}
        onResumeTask={handleResumeTask}
      />

      <NewTaskModal
        visible={newTaskVisible}
        onClose={() => setNewTaskVisible(false)}
        onSubmit={handleNewTask}
      />
      </View>
    </SafeScreen>
  );
}
