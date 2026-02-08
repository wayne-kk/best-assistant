import React from 'react';
import { View, Text, Image } from 'react-native';
import { Icon } from '../Icon';
import type { Message, MessageBlock } from '../../types/message';

function BlockRenderer({ block, isUser }: { block: MessageBlock; isUser: boolean }) {
  const textClass = isUser ? 'text-white' : 'text-text-primary';
  if (block.type === 'image') {
    return (
      <View className="mt-2 rounded-lg overflow-hidden">
        <Image
          source={{ uri: block.uri }}
          style={{ width: 200, height: 200, borderRadius: 8 }}
          resizeMode="cover"
        />
      </View>
    );
  }
  if (block.type === 'audio') {
    return (
      <View className="mt-2 flex-row items-center py-2 px-3 rounded-lg bg-white/10">
        <Icon name="mic" size={18} color={isUser ? '#fff' : '#1f1f1f'} style={{ marginRight: 8 }} />
        <Text className={textClass + ' text-sm'}>语音消息</Text>
      </View>
    );
  }
  if (block.type === 'text') {
    return (
      <Text className={`text-[15px] leading-[22px] ${textClass}`}>
        {block.value}
      </Text>
    );
  }
  if (block.type === 'list') {
    return (
      <View className="mt-2">
        {block.items.map((item, i) => (
          <Text
            key={i}
            className={`text-[15px] leading-[22px] pl-3 border-l-2 mb-1.5 ${isUser ? 'text-white border-white/50' : 'text-text-primary border-accent'}`}
          >
            • {item}
          </Text>
        ))}
      </View>
    );
  }
  if (block.type === 'extra') {
    return (
      <View className={`mt-3 p-3 rounded-xl border border-border ${isUser ? 'bg-white/20' : 'bg-accent-soft'}`}>
        <Text className={`text-xs mb-0.5 ${isUser ? 'text-white/80' : 'text-muted'}`}>{block.title}</Text>
        <Text className={`text-sm font-medium ${isUser ? 'text-white' : 'text-accent'}`}>{block.value}</Text>
      </View>
    );
  }
  return null;
}

type Props = {
  message: Message;
  streamingText?: string | null;
};

export function MessageBubble({ message, streamingText }: Props) {
  const isUser = message.role === 'user';

  const bubble = (
    <View
      className={
        isUser
          ? 'max-w-[82%] bg-bubble-user rounded-bubble rounded-br-[4px]'
          : 'max-w-[82%] bg-bubble-assistant rounded-bubble rounded-bl-[4px] border border-border'
      }
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isUser ? 0.08 : 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {message.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} isUser={isUser} />
      ))}
      {!isUser && streamingText != null && streamingText.length > 0 && (
        <Text className="text-[15px] text-text-primary leading-[22px] mt-1">
          {streamingText}
          <Text className="text-accent">▌</Text>
        </Text>
      )}
    </View>
  );

  return (
    <View className={`mb-4 ${isUser ? 'self-end' : 'self-start'}`}>
      {bubble}
    </View>
  );
}
