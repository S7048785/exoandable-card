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

## 为什么不用 motion 的 `layoutId`？

Framer Motion 提供了 `layout` prop 和 `layoutId` 用于共享元素转场动画，文档示例看起来非常适合这种"卡片展开为详情页"的场景。但在实际应用中遇到了以下问题：

### 问题汇总

| 问题 | 说明 |
|------|------|
| React Compiler 兼容性 | 项目使用了 React Compiler (babel-plugin-react-compiler)，打包后的转场动画会失效 |
| 侧边内容无退出动画 | 使用 `layoutId` 时，侧边内容区域（信息面板）无法独立控制退出动画 |
| 共享元素闪亮屏幕 | 动画过程中会出现类似"闪亮屏幕"的光晕效果，用户体验很差 |
| 生产环境动画失效 | 开发环境正常，但打包后动画完全不触发 |
| 跨组件 `layoutId` 丢失 | 路由切换后，`layoutId` 无法在组件间保持共享状态 |

### 方案演进过程

#### 方案 1：独立详情页路由 (`/posts/index` + `/posts/1`)

**思路**：传统的列表页 + 详情页结构

```typescript
// routes/posts.tsx
function PostsPage() {
  return <PostList />
}

// routes/posts.$postId.tsx
function PostDetailPage() {
  return <PostDetail />
}
```

**遇到的问题**：路由切换后，列表页会被完全卸载（unmount），无法实现转场动画。motion 需要两个元素同时存在于 DOM 中才能实现 `layoutId` 共享。

---

#### 方案 2：父路由统一渲染

**思路**：在父路由 `posts.tsx` 同时渲染列表和详情弹层

```typescript
// routes/posts.tsx
function PostsPage() {
  return (
    <>
      <PostList />
      {activePost && <PostOverlay post={activePost} />}
    </>
  )
}
```

**遇到的问题**：
- 点击卡片时，源卡片会先"淡出消失"，然后才有共享元素动画 —— 两种动画冲突
- 详情页的"回程"动画前，源卡片图片会闪一下
- 生产环境下"回程"后屏幕中间会闪过黑框

---

#### 方案 3：使用 `layoutId` 共享元素

**思路**：给卡片和详情中的同一元素设置相同的 `layoutId`

```typescript
<motion.img layoutId={`post-image-${post.id}`} src={post.image} />
```

**遇到的问题**：
- 只有设置了 `layoutId` 的元素（图片）有动画，侧边内容区域（信息面板）完全没有退出动画
- 共享元素转场时会"闪亮屏幕"
- React Compiler 与 motion 的兼容性问题导致生产打包后动画失效
- 卡片详情打开后，列表里的源图片仍在页面中可见（应该隐藏）
- 退出卡片后，图片会突然变大闪一下后又消失（动画终点计算错误）
- 点击卡片后，共享元素动画过程中，卡片详情会被其他卡片图片遮挡（z-index 问题）

---

#### 最终方案：URL 驱动 + Overlay 同层渲染 + 手动 FLIP

**核心改变**：
1. 列表页和详情 Overlay 始终在同一个组件树中（不被路由卸载）
2. 通过 `getBoundingClientRect()` 手动获取卡片位置
3. 通过 `motion.div` 的 `initial` 和 `animate` 属性手动控制动画，而不是依赖 `layoutId`
4. 点击打开时隐藏源卡片图片，避免重复显示

```typescript
// 手动获取卡片位置
const handleOpen = (item: ExploreItem) => {
  const node = cardRefs.current[item.id]
  const rect = node.getBoundingClientRect()
  setOriginRect({ top: rect.top, left: rect.left, ... })
  navigate({ to: '/explore/$id', params: { id: item.id } })
}

// 手动控制动画
<motion.div
  initial={{ top: originRect.top, left: originRect.left, ... }}
  animate={{ top: targetLayout.top, left: targetLayout.left, ... }}
/>
```

**解决了什么问题**：
- 不依赖 `layoutId`，避免了 React Compiler 冲突
- 动画完全可控，不会有意外的闪烁或残留
- 源图片可以被正确隐藏

---

## 实现过程中的具体问题列表

以下是每个尝试方案中遇到的具体问题：

### 方案 1（独立详情页路由）遇到的问题

- **列表页被卸载**：路由切换到 `/posts/1` 后，`PostList` 组件被卸载，`PostCard` 不再存在于 DOM 中，动画无法实现

### 方案 2（父路由统一渲染）遇到的问题

- **源卡片图片闪烁**：点击卡片时，源卡片先淡出消失，破坏了共享元素动画的连贯性
- **回程前源图片闪一下**：在关闭详情、动画返回之前，源卡片图片会闪烁出现
- **生产环境黑框**：生产环境下，"回程"动画完成后屏幕中间会闪过一个黑框
- **动画冲突**：列表页卡片的淡出动画和共享元素动画同时发生，产生冲突

### 方案 3（使用 layoutId）遇到的问题

- **点击时无动画**：只有退出详情时有动画，点击打开时没有共享元素动画
- **只有图片有动画**：`layoutId` 只绑定了图片元素，整个卡片的展开效果没有体现
- **源图片仍可见**：详情打开后，列表里的源图片没有被隐藏，仍然显示在背景中
- **退出时图片变大闪一下**：退出动画的终点位置计算错误，图片会突然变大后再消失
- **被其他卡片遮挡**：共享元素动画过程中，Overlay 被其他卡片图片遮挡（层叠顺序问题）
- **侧边内容无退出动画**：只有图片参与 `layoutId`，侧边信息面板完全没有动画
- **闪亮屏幕效果**：共享元素转场时会出现一个类似"闪光"的光晕效果

### 通用/环境问题

- **React Compiler 打包后失效**：motion 的内部优化与 React Compiler 冲突
- **生产环境动画失效**：开发环境正常，打包后完全不触发

---

## 总结

跨路由共享元素动画是一个复杂的场景，涉及：

1. **路由状态与组件生命周期的矛盾**：路由切换会卸载组件，但动画需要元素同时存在
2. **React Compiler 与库的兼容性**：新的优化工具可能与第三方库的内部机制冲突
3. **DOM 位置同步**：路由变化后，源元素的位置信息需要被保留或重新计算
4. **层叠上下文**：Overlay 需要在正确的 z-index 层级的渲染

最终采用的方案通过 **URL 驱动状态** + **Overlay 同层渲染** + **手动 FLIP** 的组合，绕过了 `layoutId` 的限制，实现了稳定可控的动画效果。
