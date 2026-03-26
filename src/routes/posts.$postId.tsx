import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { cards } from './posts'

export const Route = createFileRoute('/posts/$postId')({
  component: PostDetail,
})

function PostDetail() {
  const { postId } = Route.useParams()
  const router = useRouter()
  const card = cards[Number(postId) - 1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 点击背景返回列表 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => router.history.back()}
      />

      <motion.div
        layoutId={`card-${card.id}`}
        className="relative overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-row"
      >
        {/* 左侧图片 - 宽度占 40% (2:3 比例) */}
        <motion.div
          layoutId={`image-${card.id}`}
          className="w-[40%] h-full shrink-0"
        >
          <img
            src={card.src}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* 右侧文字 - 宽度占 60% */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-[60%] p-8 overflow-auto"
          >
            <motion.h3
              // layoutId={`title-${card.id}`}
              className="font-medium text-neutral-800 dark:text-neutral-200 text-2xl mb-2"
            >
              {card.title}
            </motion.h3>
            <motion.p
              // layoutId={`description-${card.id}`}
              className="text-neutral-600 dark:text-neutral-400 text-lg mb-4"
            >
              {card.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-neutral-700 dark:text-neutral-300 leading-relaxed"
            >
              {card.content}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
