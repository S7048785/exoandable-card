import { createFileRoute, useRouter } from '@tanstack/react-router'
import { motion } from 'motion/react'
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
        className="relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto"
      >
        <motion.div layoutId={`image-${card.id}`} className="w-full">
          <img
            src={card.src}
            alt={card.title}
            className="w-full h-80 object-cover object-top"
          />
        </motion.div>

        <div className="p-6">
          <motion.h3
            layoutId={`title-${card.id}`}
            className="font-medium text-neutral-800 dark:text-neutral-200 text-2xl mb-2"
          >
            {card.title}
          </motion.h3>
          <motion.p
            layoutId={`description-${card.id}`}
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
        </div>
      </motion.div>
    </div>
  )
}
