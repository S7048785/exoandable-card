# Explore 卡片详情 Overlay 实现原理

## 概述

这是一个"点击卡片跨路由打开详情"的交互效果，类似于 Pinterest 的图片展开动画。用户在 `/explore` 页面点击任意卡片，会以动画形式从卡片位置展开一个全屏 Overlay 详情层，同时 URL 会同步更新为 `/explore/$id`。

## 核心文件

| 文件 | 作用 |
|------|------|
| `src/routes/explore.tsx` | 卡片列表页主组件 |
| `src/routes/explore.$id.tsx` | 详情路由（组件返回 null） |
| `src/features/explore/ExploreCard.tsx` | 单个卡片组件 |
| `src/features/explore/ExploreOverlay.tsx` | 详情 Overlay 组件 |
| `src/features/explore/hooks/useExploreOverlayState.ts` | 核心状态管理 Hook |
| `src/features/explore/hooks/useExploreCard.ts` | 卡片交互 Hook |

## 实现原理

### 1. 双路由策略

```
/explore         → 卡片列表页
/explore/$id     → 详情路由（实际上不渲染独立页面组件）
```

`explore.$id.tsx` 的组件直接返回 `null`，这意味着访问 `/explore/some-id` 不会渲染一个独立的页面。路由的存在仅用于：

- **URL 状态同步**：让浏览器可以保存和分享链接
- **历史记录支持**：用户可以点击浏览器后退/前进按钮

### 2. 状态管理核心逻辑

`useExploreOverlayState` 是整个功能的状态中枢：

```typescript
// 从 URL 解析当前详情 ID
const detailId = useMemo(() => {
  const match = /^\/explore\/([^/]+)$/.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}, [pathname])

// 根据 ID 查找对应的数据项
const activeItem = detailId
  ? items.find((item) => item.id === detailId) ?? null
  : null
```

核心状态：
- `overlayItem`: 当前显示的卡片数据
- `originRect`: 源卡片的屏幕坐标和尺寸
- `targetLayout`: Overlay 动画的目标位置和尺寸
- `isClosing`: 是否正在关闭（控制动画方向）

### 3. 打开流程

```
用户点击卡片
    ↓
ExploreCard.handleClick()
    ↓
useExploreOverlayState.handleOpen(item)
    ├─ 记录卡片 DOM 位置到 originRect
    ├─ 设置 overlayItem = item
    └─ navigate({ to: '/explore/$id', params: { id: item.id } })
    ↓
useEffect 监听 activeItem 变化
    ↓
ExploreOverlay 开始动画：从 originRect → targetLayout
```

### 4. 关闭流程

```
用户点击关闭/背景/ESC
    ↓
handleClose()
    ├─ 设置 isClosing = true（触发动画返回）
    └─ navigate({ to: '/explore' })  ← URL 先变化
    ↓
activeItem 变为 null
    ↓
useEffect 触发 beginClose()
    ↓
420ms 后 overlayItem 设为 null，动画完成
```

### 5. 图片隐藏逻辑

当某个卡片被打开时，它的图片会隐藏，避免在背景中重复出现：

```typescript
// explore.tsx
<ExploreCard
  hiddenImage={hiddenId === item.id}  // hiddenId 是当前打开的卡片 ID
  ...
/>
```

```typescript
// useExploreCard.ts
imageVisibility: hiddenImage ? 'hidden' : 'visible'
```

### 6. 动画实现

使用 `motion` (Framer Motion) 实现 FLIP 风格的动画：

```typescript
<motion.div
  initial={{
    top: originRect.top,
    left: originRect.left,
    width: originRect.width,
    height: originRect.height,
    borderRadius: 28,  // 卡片圆角
  }}
  animate={isClosing ? { /* 回到原位 */ } : {
    top: targetLayout.top,
    left: targetLayout.left,
    width: targetLayout.width,
    height: targetLayout.height,
    borderRadius: 32,  // Overlay 圆角
  }}
  transition={{
    duration: isClosing ? 0.32 : 0.38,
    ease: [0.22, 1, 0.36, 1],
  }}
/>
```

### 7. 目标布局计算

`targetLayout` 根据视口大小计算 Overlay 的最终位置：

- **桌面端 (>= 900px)**：左右布局（图片 + 信息面板）
- **移动端 (< 900px)**：上下布局

```typescript
const targetLayout = {
  top: Math.max(24, (viewport.height - height) / 2),
  left: (viewport.width - width) / 2,
  width: imageWidth + panelWidth,
  height: clamp(viewport.height * 0.82, 520, 760),
  ...
}
```

## 数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                      URL 变化                               │
│                   /explore ↔ /explore/$id                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               useExploreOverlayState                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useRouterState → pathname → detailId                  │  │
│  │ detailId + items → activeItem                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
   activeItem === null               activeItem !== null
   (关闭状态)                          (打开状态)
          │                                 │
          ▼                                 ▼
   isClosing=true                  显示 ExploreOverlay
   动画返回 → 移除                      从 originRect
                                        动画到 targetLayout
```

## 关键设计决策

1. **路由作为状态**：使用 URL 作为唯一数据源，而不是 React 内部状态，这样刷新页面、分享链接都能正确恢复状态。

2. **Overlay 而非页面**：详情以 Overlay 形式覆盖在列表页上，而不是独立的路由页面，这样可以有流畅的动画过渡。

3. **虚路由**：`/explore/$id` 的组件返回 `null`，因为实际的 UI 是 Overlay，而不是一个独立页面。

4. **DOM 引用缓存**：使用 `useRef` 缓存所有卡片的 DOM 节点引用，这样在动画启动时可以直接获取卡片位置，不需要额外查询。
