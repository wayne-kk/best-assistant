import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useChatStore } from '../store/chatStore';
import { useTaskStore } from '../store/taskStore';
import { MessageBubble } from '../components/MessageBubble';
import { sendChat } from '../services/aiClient';
import { getMockResponse, mockStreamReply } from '../services/mockAi';
import type { MessageBlock } from '../types/message';
import type { MockResponse } from '../services/mockAi';
import type { TaskPlan } from '../types/task';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from '../types/navigation';
import { Icon } from '../components/Icon';
import { SafeScreen } from '../components/SafeScreen';
import { StickyFocusBar } from '../components/StickyFocusBar';
import { TaskSwitchDrawer } from '../components/TaskSwitchDrawer';

const USE_MOCK = true; // 无 BFF 时用模拟；接入 BFF 后改为 false 并调用 aiClient/streamClient

type ChatNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Assistant'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ChatScreen({ navigation }: { navigation: ChatNav }) {
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const {
    getActiveTask,
    getActiveTasks,
    getPausedTasks,
    setCurrentTask,
    setTaskRunState,
    addTask,
    updateStep,
    setCurrentStep,
    advanceCurrentStep,
    persist: persistTask,
  } = useTaskStore();
  const focusTask = getActiveTask();
  const activeTasks = getActiveTasks();
  const pausedTasks = getPausedTasks();
  const {
    messages,
    isLoading,
    addMessage,
    setStreamingContent,
    commitStreamingToMessage,
    loadFromStorage,
    persist,
  } = useChatStore();
  const streamingContent = useChatStore((s) => s.streamingContent);
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingAudioUri, setPendingAudioUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const flatRef = useRef<FlatList>(null);
  const cancelStreamRef = useRef<(() => void) | null>(null);
  const streamingBufferRef = useRef('');

  useEffect(() => {
    loadFromStorage();
    useTaskStore.getState().loadFromStorage();
  }, []);

  useEffect(() => {
    if (messages.length) persist();
  }, [messages]);

  const activeTask = focusTask;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相册权限', '请在设置中允许访问相册以选择图片');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      const uris = result.assets.map((a: { uri: string }) => a.uri);
      setSelectedImages((prev) => [...prev, ...uris].slice(0, 9));
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((u) => u !== uri));
  };

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要麦克风权限', '请在设置中允许使用麦克风进行语音输入');
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      await recording.startAsync();
      setIsRecording(true);
    } catch (e) {
      Alert.alert('录音失败', e instanceof Error ? e.message : '无法开始录音');
    }
  };

  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (uri) setPendingAudioUri(uri);
    } finally {
      recordingRef.current = null;
      setIsRecording(false);
    }
  };

  const clearPendingAudio = () => setPendingAudioUri(null);

  const send = async () => {
    const text = input.trim();
    const blocks: MessageBlock[] = [
      ...selectedImages.map((uri) => ({ type: 'image' as const, uri })),
      ...(pendingAudioUri ? [{ type: 'audio' as const, uri: pendingAudioUri }] : []),
      ...(text ? [{ type: 'text' as const, value: text }] : []),
    ];
    if (blocks.length === 0 || isLoading) return;
    setInput('');
    setSelectedImages([]);
    setPendingAudioUri(null);
    addMessage('user', blocks);
    const textForApi = text || '[图片/语音]';
    useChatStore.setState({ isLoading: true });

    if (USE_MOCK) {
      const res: MockResponse = getMockResponse(textForApi, activeTask ?? null, activeTask ? useTaskStore.getState().getCurrentStep() : null);
      const { blocks, task, advanceStep } = res;
      if (advanceStep) {
        const result = advanceCurrentStep();
        if (result) void persistTask();
      }
      if (task) {
        useTaskStore.getState().setTaskFromServer(task);
        void persistTask();
      }
      addMessage('assistant', []);
      setStreamingContent('');
      streamingBufferRef.current = '';
      const fullText = blocks
        .map((b) => (b.type === 'text' ? b.value : b.type === 'extra' ? b.value : ''))
        .filter(Boolean)
        .join('\n');
      cancelStreamRef.current = mockStreamReply(
        fullText,
        (chunk) => {
          streamingBufferRef.current += chunk;
          setStreamingContent(streamingBufferRef.current);
        },
        () => {
          commitStreamingToMessage(blocks);
          setStreamingContent(null);
          useChatStore.setState({ isLoading: false });
        },
        25
      );
      return;
    }

    try {
      const payload = {
        messages: [
          ...messages.map((m) => ({
            role: m.role,
            content: m.blocks.map((b) => (b.type === 'text' ? b.value : JSON.stringify(b))).join('\n'),
          })),
          { role: 'user' as const, content: textForApi },
        ],
        currentTaskId: activeTask?.id ?? null,
        currentStepId: activeTask?.steps.find((s) => s.status === 'doing')?.id ?? null,
        taskContext: activeTask ? `${activeTask.title}: ${activeTask.goal}` : null,
      };
      const res = await sendChat(payload);
      const blocks: MessageBlock[] = [{ type: 'text', value: res.content }];
      addMessage('assistant', blocks);
      if (res.taskCreated) {
        const plan: TaskPlan = {
          id: res.taskCreated.id,
          title: res.taskCreated.title,
          goal: activeTask?.goal ?? '',
          steps: res.taskCreated.steps.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            status: s.status as 'todo' | 'doing' | 'done',
          })),
          status: 'active',
          createdAt: Date.now(),
        };
        useTaskStore.getState().setTaskFromServer(plan);
        persistTask();
      }
      if (res.stepAdvanced) {
        updateStep(res.stepAdvanced.taskId, res.stepAdvanced.stepId, { status: 'done' });
        setCurrentStep(res.stepAdvanced.stepId);
        persistTask();
      }
    } catch (e) {
      addMessage('assistant', [{ type: 'text', value: '网络或服务异常，请稍后再试。' }]);
    }
    useChatStore.setState({ isLoading: false });
  };

  const listData = [...messages];
  if (streamingContent !== null && listData.length > 0 && listData[listData.length - 1].role === 'assistant') {
    listData[listData.length - 1] = { ...listData[listData.length - 1], blocks: [] };
  }

  return (
    <SafeScreen>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-surface"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StickyFocusBar
        task={focusTask}
        onPress={() => setDrawerVisible(true)}
      />
      <FlatList
        ref={flatRef}
        data={listData}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            streamingText={item.role === 'assistant' && item.id === listData[listData.length - 1]?.id ? streamingContent : null}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center px-10 py-16">
            <View className="w-16 h-16 rounded-full bg-accent-soft items-center justify-center mb-5">
              <Icon name="sparkles" size={36} color="#1677ff" />
            </View>
            <Text className="text-text-primary text-center text-lg font-medium mb-1.5">
              说一个你想做的事
            </Text>
            <Text className="text-text-secondary text-center text-[15px] leading-6">
              我会帮你拆成步骤、一步步推进
            </Text>
            <View className="mt-6 px-4 py-3 rounded-xl bg-surface-elevated border border-border self-stretch mx-2">
              <Text className="text-muted text-center text-sm">例如：帮我规划一次日本旅行</Text>
            </View>
          </View>
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />
      <View
        className="px-4 pt-3 bg-surface border-t border-border"
        style={{ paddingBottom: Platform.OS === 'ios' ? 28 : 24 }}
      >
        {selectedImages.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-2">
            {selectedImages.map((uri) => (
              <View key={uri} className="relative">
                <Image
                  source={{ uri }}
                  style={{ width: 56, height: 56, borderRadius: 8 }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => removeImage(uri)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/60 items-center justify-center"
                >
                  <Icon name="close" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
        {pendingAudioUri && (
          <View className="flex-row items-center mb-2 py-2 px-3 rounded-lg bg-accent-soft border border-border">
            <Icon name="mic" size={18} color="#1677ff" style={{ marginRight: 8 }} />
            <Text className="text-text-primary text-sm flex-1">已录语音，可发送或清除</Text>
            <Pressable onPress={clearPendingAudio} className="px-2 py-1">
              <Text className="text-muted text-sm">清除</Text>
            </Pressable>
          </View>
        )}
        {isRecording && (
          <View className="flex-row items-center mb-2 py-2 px-3 rounded-lg bg-red-50 border border-red-200">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" style={{ opacity: 0.8 }} />
            <Text className="text-red-600 text-sm flex-1">录音中…</Text>
            <Pressable onPress={stopRecording} className="px-3 py-1.5 rounded bg-red-500">
              <Text className="text-white text-sm font-medium">结束</Text>
            </Pressable>
          </View>
        )}
        <View className="flex-row items-end">
          <Pressable
            onPress={pickImage}
            disabled={isLoading}
            className="mr-2 w-10 h-10 rounded-full bg-surface-elevated border border-border items-center justify-center"
          >
            <Icon name="image-outline" size={22} color="#595959" />
          </Pressable>
          {!isRecording && !pendingAudioUri ? (
            <Pressable
              onPress={startRecording}
              disabled={isLoading}
              className="mr-2 w-10 h-10 rounded-full bg-surface-elevated border border-border items-center justify-center"
            >
              <Icon name="mic-outline" size={22} color="#595959" />
            </Pressable>
          ) : null}
          <TextInput
            className="flex-1 bg-surface-elevated text-text-primary rounded-input px-4 py-3.5 text-[15px] max-h-24 border border-border"
            placeholder="输入想法或下一步..."
            placeholderTextColor="#8c8c8c"
            value={input}
            onChangeText={setInput}
            multiline
            editable={!isLoading}
            onSubmitEditing={send}
          />
          <Pressable
            onPress={send}
            disabled={(input.trim() === '' && selectedImages.length === 0 && !pendingAudioUri) || isLoading}
            className="ml-3 w-12 h-12 rounded-full bg-accent justify-center items-center active:opacity-90"
            style={({ pressed }) => ({
              opacity: (input.trim() === '' && selectedImages.length === 0 && !pendingAudioUri) || isLoading ? 0.5 : pressed ? 0.9 : 1,
            })}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-semibold text-[15px]">发送</Text>
            )}
          </Pressable>
        </View>
      </View>
      <TaskSwitchDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeTasks={activeTasks}
        pausedTasks={pausedTasks}
        currentTaskId={focusTask?.id ?? null}
        onSelectTask={(taskId) => {
          setCurrentTask(taskId);
          setDrawerVisible(false);
          void persistTask();
        }}
        onPauseTask={(taskId) => {
          setTaskRunState(taskId, 'paused');
          void persistTask();
        }}
        onResumeTask={(taskId) => {
          setTaskRunState(taskId, 'active');
          setCurrentTask(taskId);
          setDrawerVisible(false);
          void persistTask();
        }}
      />
    </KeyboardAvoidingView>
    </SafeScreen>
  );
}
