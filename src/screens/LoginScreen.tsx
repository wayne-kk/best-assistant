import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Icon } from '../components/Icon';
import { SafeScreen } from '../components/SafeScreen';
import { useAuthStore } from '../store/authStore';

export function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    clearError();
  }, [account, password, clearError]);

  const handleSubmit = async () => {
    const trimmedAccount = account.trim();
    if (!trimmedAccount) return;
    if (!password) return;
    try {
      await login({
        account: trimmedAccount,
        password,
        rememberMe,
      });
    } catch {
      // 错误已由 store 设置
    }
  };

  return (
    <SafeScreen>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-surface"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-8 pt-12 pb-8">
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-accent-soft items-center justify-center mb-4">
              <Icon name="sparkles" size={44} color="#1677ff" />
            </View>
            <Text className="text-2xl font-semibold text-text-primary">MoreAI</Text>
            <Text className="text-text-secondary text-sm mt-1">登录后同步你的任务与对话</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-text-secondary mb-2">账号</Text>
            <TextInput
              className="bg-surface-elevated border border-border rounded-input px-4 py-3.5 text-[15px] text-text-primary"
              placeholder="手机号或邮箱"
              placeholderTextColor="#8c8c8c"
              value={account}
              onChangeText={setAccount}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
          <View className="mb-5">
            <Text className="text-sm text-text-secondary mb-2">密码</Text>
            <TextInput
              className="bg-surface-elevated border border-border rounded-input px-4 py-3.5 text-[15px] text-text-primary"
              placeholder="请输入密码"
              placeholderTextColor="#8c8c8c"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {error ? (
            <View className="mb-4 py-2.5 px-3 rounded-lg bg-red-50 border border-red-200">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => setRememberMe((v) => !v)}
            className="flex-row items-center mb-6"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <View
              className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                rememberMe ? 'bg-accent border-accent' : 'border-border'
              }`}
            >
              {rememberMe ? <Text className="text-white text-xs">✓</Text> : null}
            </View>
            <Text className="text-text-secondary text-[15px]">记住登录状态</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={isLoading || !account.trim() || !password}
            className="bg-accent py-4 rounded-input items-center justify-center active:opacity-90"
            style={({ pressed }) => ({
              opacity: isLoading || !account.trim() || !password ? 0.6 : pressed ? 0.9 : 1,
            })}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white font-semibold text-[16px]">登录</Text>
            )}
          </Pressable>

          <Text className="text-muted text-xs text-center mt-6">
            未注册的账号将使用演示模式登录
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeScreen>
  );
}
