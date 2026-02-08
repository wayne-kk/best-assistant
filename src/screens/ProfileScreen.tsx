import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Icon } from '../components/Icon';
import { SafeScreen } from '../components/SafeScreen';
import { useAuthStore } from '../store/authStore';

const MENU_ITEMS = [
  { key: 'skill', label: '我的 Skill', icon: 'construct-outline' as const },
  { key: 'knowledge', label: '知识库管理', icon: 'library-outline' as const },
  { key: 'archive', label: '历史任务归档', icon: 'archive-outline' as const },
  { key: 'settings', label: '设置', icon: 'settings-outline' as const },
];

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <SafeScreen>
      <View className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center py-8 border-b border-border">
          <View className="w-20 h-20 rounded-full bg-accent-soft items-center justify-center mb-3">
            <Text className="text-3xl">
              {user?.name?.slice(0, 1)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text className="text-xl font-semibold text-text-primary">
            {user?.name ?? '未设置昵称'}
          </Text>
        </View>

        <View className="mt-4">
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              className="flex-row items-center py-4 px-4 rounded-card bg-surface-elevated border border-border mb-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Icon name={item.icon} size={22} color="#595959" style={{ marginRight: 12 }} />
              <Text className="text-text-primary font-medium flex-1">{item.label}</Text>
              <Icon name="chevron-forward" size={18} color="#8c8c8c" />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => logout()}
          className="mt-6 py-4 rounded-card border border-border items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Text className="text-muted">退出登录</Text>
        </Pressable>
      </ScrollView>
      </View>
    </SafeScreen>
  );
}
