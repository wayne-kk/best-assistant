import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 22, color = '#595959', style }: Props) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
