import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = ViewProps & {
  /** 是否应用顶部安全区内边距（避开状态栏/刘海） */
  safeTop?: boolean;
  /** 是否应用底部的安全区内边距（避开 Home 指示条），默认 false，Tab 页由 TabBar 处理 */
  safeBottom?: boolean;
};

/**
 * 为无系统 header 的页面提供安全区适配，避免内容被状态栏或刘海遮挡。
 */
export function SafeScreen({ safeTop = true, safeBottom = false, style, children, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { flex: 1 },
        safeTop && { paddingTop: insets.top },
        safeBottom && { paddingBottom: insets.bottom },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
