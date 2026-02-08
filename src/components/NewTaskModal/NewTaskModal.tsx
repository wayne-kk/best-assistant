import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const QUICK_ACTIONS = [
  { label: '写方案', value: '帮我写一份方案' },
  { label: '写代码', value: '帮我写代码' },
  { label: '做计划', value: '帮我做一个计划' },
  { label: '分析文档', value: '帮我分析文档' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
};

export function NewTaskModal({ visible, onClose, onSubmit }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    onSubmit(text);
    setInput('');
    onClose();
  };

  const handleQuick = (value: string) => {
    onSubmit(value);
    setInput('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        className="flex-1 bg-black/40 justify-end"
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            className="bg-surface-elevated rounded-t-2xl p-5 pb-10"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-semibold text-text-primary mb-4">
              你想做什么？
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {QUICK_ACTIONS.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handleQuick(item.value)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-surface"
                >
                  <Text className="text-text-primary text-sm">{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              className="bg-surface border border-border rounded-input px-4 py-3 text-[15px] text-text-primary mb-4"
              placeholder="自由输入……"
              placeholderTextColor="#8c8c8c"
              value={input}
              onChangeText={setInput}
              multiline
              editable
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="flex-1 py-3 rounded-input border border-border items-center"
              >
                <Text className="text-text-secondary">取消</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={!input.trim()}
                className="flex-1 py-3 rounded-input bg-accent items-center"
                style={{ opacity: input.trim() ? 1 : 0.5 }}
              >
                <Text className="text-white font-medium">开始</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
