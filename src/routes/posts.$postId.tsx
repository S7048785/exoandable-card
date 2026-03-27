import { getRouter } from '#/router'
import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cards } from './posts'

export const Route = createFileRoute('/posts/$postId')({
  component: PostDetail,
})

function PostDetail() {
  const { postId } = Route.useParams()

  const router = getRouter()
  const card = cards.find((c) => c.id === Number(postId))!
  const [isClosing, setIsClosing] = useState(false)
  return (
    <div className="fixed inset-0 grid place-items-center">
      {/* 点击背景返回列表 */}
      <div className="absolute inset-0 " onClick={() => setIsClosing(true)} />
      <AnimatePresence
        onExitComplete={() => {
          // 重点：当 exit 动画彻底结束时，才切换 URL
          router.history.back()
        }}
      >
        {!isClosing && (
          <motion.div
            layoutId={`card-${card.title}`}
            className="w-full h-full md:h-fit max-w-[800px] md:max-h-[90%] flex bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden z-10"
          >
            <motion.div
              layoutId={`image-${card.title}`}
              className="w-80 lg:w-80 sm:rounded-tr-lg sm:rounded-tl-lg z-50"
            >
              <img
                width={200}
                height={200}
                src={card.src}
                alt={card.title}
                className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
              />
            </motion.div>

            <motion.div className="flex-1">
              <div className="flex justify-between items-start p-4">
                <div className="">
                  <h3 className="font-medium text-neutral-700 dark:text-neutral-200 text-base">
                    {card.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-base">
                    {card.description}
                  </p>
                </div>
              </div>
              <div className="pt-4 relative px-4">
                <div className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
                  {card.content}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
