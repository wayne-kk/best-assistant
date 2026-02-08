import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { TaskPlan } from '../../types/task';

const dotColors: Record<string, string> = {
  active: '#1677ff',
  paused: '#8c8c8c',
};

type Props = {
  visible: boolean;
  onClose: () => void;
  activeTasks: TaskPlan[];
  pausedTasks: TaskPlan[];
  currentTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onPauseTask: (taskId: string) => void;
  onResumeTask: (taskId: string) => void;
};

export function TaskSwitchDrawer({
  visible,
  onClose,
  activeTasks,
  pausedTasks,
  currentTaskId,
  onSelectTask,
  onPauseTask,
  onResumeTask,
}: Props) {
  const renderTask = (task: TaskPlan, isPaused: boolean) => {
    const isCurrent = task.id === currentTaskId;
    const dotColor = dotColors[isPaused ? 'paused' : 'active'];

    return (
      <Pressable
        key={task.id}
        onPress={() => {
          if (isPaused) onResumeTask(task.id);
          else onSelectTask(task.id);
          onClose();
        }}
        style={({ pressed }) => [
          styles.taskRow,
          isCurrent && styles.taskRowCurrent,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text className="text-text-primary font-medium flex-1" numberOfLines={1}>
          {task.title}
        </Text>
        {isPaused ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onResumeTask(task.id);
              onClose();
            }}
            className="px-2 py-1 rounded bg-accent"
          >
            <Text className="text-white text-xs">继续</Text>
          </Pressable>
        ) : (
          isCurrent && (
            <Text className="text-muted text-xs">当前</Text>
          )
        )}
        {!isPaused && !isCurrent && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onPauseTask(task.id);
            }}
            className="px-2 py-1 rounded border border-border ml-1"
          >
            <Text className="text-text-secondary text-xs">暂停</Text>
          </Pressable>
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
          <View className="border-b border-border pb-2 mb-2">
            <Text className="text-lg font-semibold text-text-primary">切换任务</Text>
            <Text className="text-muted text-sm mt-0.5">右滑/点击设为聚焦，可暂停或继续</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTasks.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-muted mb-2">
                  进行中 ({activeTasks.length})
                </Text>
                {activeTasks.map((t) => renderTask(t, false))}
              </View>
            )}
            {pausedTasks.length > 0 && (
              <View>
                <Text className="text-sm font-medium text-muted mb-2">
                  已暂停 ({pausedTasks.length})
                </Text>
                {pausedTasks.map((t) => renderTask(t, true))}
              </View>
            )}
            {activeTasks.length === 0 && pausedTasks.length === 0 && (
              <Text className="text-muted text-center py-8">暂无任务，去新建一个吧</Text>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    padding: 20,
    paddingBottom: 40,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  taskRowCurrent: {
    backgroundColor: '#e6f4ff',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});
