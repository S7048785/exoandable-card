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
        className="relative overflow-auto bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex"
      >
        <motion.div layoutId={`image-${card.id}`}>
          <img src={card.src} alt={card.title} className=" rounded-xl " />
        </motion.div>

        <div className="p-6">
          <h3
            // layoutId={`title-${card.id}`}
            className="font-medium text-neutral-800 dark:text-neutral-200 text-2xl mb-2"
          >
            {card.title}
          </h3>
          <p
            // layoutId={`description-${card.id}`}
            className="text-neutral-600 dark:text-neutral-400 text-lg mb-4"
          >
            {card.description}
          </p>
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
