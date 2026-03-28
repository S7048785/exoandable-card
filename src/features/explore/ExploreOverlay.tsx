import type { ExploreItem } from '@/lib/data'
import { AnimatePresence, motion } from 'motion/react'
import type {
  ExploreOverlayLayout,
  RectLike,
} from './hooks/useExploreOverlayState'

type ExploreOverlayProps = {
  item: ExploreItem | null
  originRect: RectLike | null
  targetLayout: ExploreOverlayLayout | null
  isClosing: boolean
  onClose: () => void
}

export function ExploreOverlay({
  item,
  originRect,
  targetLayout,
  isClosing,
  onClose,
}: ExploreOverlayProps) {
  const activeOverlay = item && originRect && targetLayout

  return (
    <AnimatePresence initial={false}>
      {activeOverlay ? (
        <div className="fixed inset-0 z-200">
          <motion.button
            type="button"
            aria-label="Close detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/12 backdrop-blur-[2px]"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onClose()
            }}
          />

          <motion.div
            initial={{
              top: originRect.top,
              left: originRect.left,
              width: originRect.width,
              height: originRect.height,
              borderRadius: 28,
            }}
            animate={
              isClosing
                ? {
                    top: originRect.top,
                    left: originRect.left,
                    width: originRect.width,
                    height: originRect.height,
                    borderRadius: 28,
                  }
                : {
                    top: targetLayout.top,
                    left: targetLayout.left,
                    width: targetLayout.width,
                    height: targetLayout.height,
                    borderRadius: 32,
                  }
            }
            exit={{
              top: originRect.top,
              left: originRect.left,
              width: originRect.width,
              height: originRect.height,
              borderRadius: 28,
            }}
            transition={{
              duration: isClosing ? 0.32 : 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute overflow-hidden bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)] dark:bg-neutral-900"
            onPointerDown={(event) => {
              event.stopPropagation()
            }}
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <div
              className={`flex h-full w-full ${targetLayout.isMobile ? 'flex-col' : 'flex-row'}`}
            >
              <motion.div
                initial={false}
                animate={
                  isClosing
                    ? {
                        width: originRect.width,
                        height: originRect.height,
                      }
                    : {
                        width: targetLayout.imageWidth,
                        height: targetLayout.imageHeight,
                      }
                }
                transition={{
                  duration: isClosing ? 0.32 : 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="shrink-0 overflow-hidden bg-black"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </motion.div>

              <motion.div
                initial={false}
                animate={
                  targetLayout.isMobile
                    ? isClosing
                      ? {
                          height: 0,
                          opacity: 0,
                        }
                      : {
                          height: targetLayout.panelHeight,
                          opacity: 1,
                        }
                    : isClosing
                      ? {
                          width: 0,
                          opacity: 0,
                        }
                      : {
                          width: targetLayout.panelWidth,
                          opacity: 1,
                        }
                }
                transition={{
                  duration: isClosing ? 0.18 : 0.24,
                  ease: [0.22, 1, 0.36, 1],
                  delay: isClosing ? 0 : 0.08,
                }}
                className="overflow-hidden bg-white dark:bg-neutral-900"
              >
                <motion.div
                  initial={false}
                  animate={
                    isClosing ? { opacity: 0, x: 18 } : { opacity: 1, x: 0 }
                  }
                  transition={{
                    duration: isClosing ? 0.12 : 0.18,
                    ease: 'easeOut',
                    delay: isClosing ? 0 : 0.16,
                  }}
                  className="flex h-full min-w-[280px] flex-col"
                >
                  <div className="border-b border-black/6 px-5 py-4 dark:border-white/10">
                    <p className="text-sm text-(--sea-ink-soft)">
                      {item.author}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-(--sea-ink) dark:text-neutral-100">
                      {item.title}
                    </h3>
                  </div>
                  <div className="min-h-0 flex-1 px-5 py-4">
                    <div className="h-full overflow-auto pr-1 text-sm leading-7 text-(--sea-ink-soft) dark:text-neutral-300 [scrollbar-width:none] [-ms-overflow-style:none]">
                      {item.content}
                    </div>
                  </div>
                  <div className="border-t border-black/6 px-5 py-4 text-sm text-(--sea-ink-soft) dark:border-white/10 dark:text-neutral-400">
                    {item.subtitle}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
