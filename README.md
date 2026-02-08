# MoreAI

MoreAI 是一款任务规划型手机助手。基于 React Native (Expo) + TypeScript + NativeWind + Zustand + AsyncStorage 实现的 MVP。

## 功能

- **对话 UI**：聊天界面，支持流式输出（当前为模拟）
- **任务生成**：说「帮我规划一次日本旅行」等会生成任务并拆解步骤
- **任务卡片**：当前任务展示、点击进入任务详情
- **步骤状态**：todo / doing / done，持久化到 AsyncStorage

## 运行

```bash
cd task-assistant
npm install
npx expo start
```

按 `i` 打开 iOS 模拟器，`a` 打开 Android 模拟器。

## 接入真实 BFF

1. 在项目根目录创建 `.env`（或 Expo 环境变量）设置 `EXPO_PUBLIC_BFF_URL=你的BFF地址`
2. 在 `src/screens/ChatScreen.tsx` 将 `USE_MOCK` 改为 `false`
3. BFF 需实现：
   - `POST /api/chat`：非流式对话，返回 `{ content, taskCreated?, stepAdvanced? }`
   - 或 `POST /api/chat/stream`：SSE 流式，见 `src/services/streamClient.ts`

## 目录结构

```
src/
├── screens/       ChatScreen, TaskDetailScreen
├── components/    MessageBubble, TaskCard, StepItem
├── store/         chatStore, taskStore (Zustand)
├── services/      aiClient, streamClient, mockAi
├── types/         message, task, navigation
└── utils/         storage, id
```

## 技术栈

- Expo ~52, React Native, TypeScript
- NativeWind (TailwindCSS)
- Zustand, AsyncStorage
- React Navigation (native-stack)
