在 **TanStack Start** 中实现类似小红书的“点击列表进入详情”共享元素动画，最核心的逻辑是处理 **并行路由（Parallel Routes）**。

因为如果你直接从 `/explore` 跳转到 `/post/123`，旧页面会被完全卸载，动画往往会中断或难以捕捉。我们需要让详情页以 **Modal（模态框）** 的形式“盖”在列表页上，同时保持 URL 的更新。

---

### 1. 项目目录结构

在 TanStack Start (基于文件系统的路由) 中，我们需要利用 **布局路由** 来保持列表页不被销毁。

```text
app/
├── routes/
│   ├── _layout.tsx       // 公共布局
│   ├── index.tsx         // 首页 (重定向到 /explore)
│   ├── explore.tsx       // 列表页 (保持挂载)
│   ├── explore.$id.tsx   // 详情页 (作为子路由弹出 Modal)
```

---

### 2. 核心代码实现

#### 第一步：在 `explore.tsx` 中预留插槽

这是关键。点击卡片时，我们进入的是 `explore.$id` 子路由，`Outlet` 会渲染详情内容，而 `explore` 本身的列表内容依然存在。

```tsx
// app/routes/explore.tsx
import { Outlet, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/explore')({
  component: ExplorePage,
})

function ExplorePage() {
  const posts = [
    /* 你的数据 */
  ]

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          to="/explore/$id"
          params={{ id: post.id }}
          className="cursor-pointer"
        >
          {/* 列表中的图片 */}
          <motion.img
            layoutId={`img-${post.id}`} // 关键：共享 ID
            src={post.thumbUrl}
            className="w-full rounded-lg"
          />
        </Link>
      ))}

      {/* 渲染详情页 Modal */}
      <Outlet />
    </div>
  )
}
```

#### 第二步：在 `explore.$id.tsx` 中实现 Modal

详情页不再是一个独立的页面，而是一个全屏的浮层。

```tsx
// app/routes/explore.$id.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/explore/$id')({
  component: PostDetail,
})

function PostDetail() {
  const { id } = Route.useParams()
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* 点击背景返回列表 */}
      <div className="absolute inset-0" onClick={() => router.history.back()} />

      <motion.div
        layoutId={`container-${id}`} // 容器也可以做共享
        className="relative bg-white p-2 rounded-xl max-w-2xl w-full"
      >
        <motion.img
          layoutId={`img-${id}`} // 必须与列表页中的 layoutId 完全一致
          src={`/api/high-res/${id}.jpg`} // 这里可以用高清图
          className="w-full h-auto rounded-lg"
        />
        <div className="p-4">
          <h2>帖子详情 {id}</h2>
          <p>这里是详情内容...</p>
        </div>
      </motion.div>
    </div>
  )
}
```

---

### 3. 实现原理详解

1.  **Layout ID 匹配**：当 TanStack Router 渲染 `Outlet` 里的新组件时，`framer-motion` 发现新旧两个组件拥有相同的 `layoutId`。
2.  **自动 FLIP 计算**：Framer Motion 会在幕后自动测量列表小图的 `BoundingBox` 和 Modal 大图的 `BoundingBox`。
3.  **补间补齐**：它会创建一个临时的投影元素，执行位置、大小甚至是圆角的平滑过渡。
4.  **URL 同步**：因为使用了 `explore.$id` 这种嵌套结构，当你点击“返回”时，URL 回退到 `/explore`，子路由卸载，图片又会顺着 `layoutId` 飞回列表里的原位。

---

### 4. 进阶优化建议

- **滚动位置保持**：由于列表页在 `explore.tsx` 中始终挂载，当你关闭 Modal 时，滚动条位置是天然保持的，这和小红书体验一致。
- **占位图策略**：在 `explore.$id.tsx` 中，由于高清图加载需要时间，建议 `motion.img` 的 `src` 先设为列表传过来的缩略图（可以通过 `search` 参数或全局状态传递），等大图 `onLoad` 之后再替换。
- **退出动画**：确保在 `explore.$id.tsx` 中包裹 `AnimatePresence`（虽然在嵌套路由中处理稍复杂，但 `layoutId` 本身已经能处理大部分“飞回去”的视觉逻辑）。

**你想让我演示一下如何通过 TanStack Router 的 `search` 参数在页面间传递缩略图数据，以保证转场瞬间不白屏吗？**
