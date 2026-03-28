import {
  createFileRoute,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

export const Route = createFileRoute('/explore')({
  component: RouteComponent,
})

type ExploreItem = {
  id: string
  author: string
  title: string
  subtitle: string
  image: string
  imageHeight: number
  content: string
}

type RectLike = {
  top: number
  left: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function RouteComponent() {
  const navigate = useNavigate()
  const matchRoute = useMatchRoute()
  const detailMatch = matchRoute({ to: '/explore/$id' })
  const activeItem = detailMatch
    ? (exploreItems.find((item) => item.id === detailMatch.id) ?? null)
    : null

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const closeTimeoutRef = useRef<number | null>(null)
  const [overlayItem, setOverlayItem] = useState<ExploreItem | null>(null)
  const [originRect, setOriginRect] = useState<RectLike | null>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    function updateViewport() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    if (!overlayItem) {
      document.body.style.overflow = 'auto'
      return
    }

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [overlayItem])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current)
      }
      document.body.style.overflow = 'auto'
    }
  }, [])

  useEffect(() => {
    if (!activeItem) {
      return
    }

    setOverlayItem(activeItem)
    setIsClosing(false)

    const frame = window.requestAnimationFrame(() => {
      const node = cardRefs.current[activeItem.id]
      if (!node) {
        return
      }

      const rect = node.getBoundingClientRect()
      setOriginRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeItem])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && overlayItem && !isClosing) {
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [overlayItem, isClosing])

  const targetLayout = useMemo(() => {
    if (!viewport.width || !viewport.height) {
      return null
    }

    const isMobile = viewport.width < 900

    if (isMobile) {
      const width = Math.min(viewport.width - 24, 460)
      const height = Math.min(viewport.height - 32, 760)
      const imageHeight = Math.round(height * 0.6)

      return {
        top: Math.max(16, (viewport.height - height) / 2),
        left: (viewport.width - width) / 2,
        width,
        height,
        imageWidth: width,
        imageHeight,
        panelWidth: width,
        panelHeight: height - imageHeight,
        isMobile,
      }
    }

    const imageWidth = clamp(viewport.width * 0.34, 320, 520)
    const panelWidth = clamp(viewport.width * 0.24, 280, 360)
    const width = imageWidth + panelWidth
    const height = clamp(viewport.height * 0.82, 520, 760)

    return {
      top: Math.max(24, (viewport.height - height) / 2),
      left: (viewport.width - width) / 2,
      width,
      height,
      imageWidth,
      imageHeight: height,
      panelWidth,
      panelHeight: height,
      isMobile,
    }
  }, [viewport.height, viewport.width])

  function handleOpen(item: ExploreItem) {
    const node = cardRefs.current[item.id]
    if (!node) {
      return
    }

    const rect = node.getBoundingClientRect()
    setOriginRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
    setOverlayItem(item)
    setIsClosing(false)

    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    void navigate({ to: '/explore/$id', params: { id: item.id } })
  }

  function handleClose() {
    if (!overlayItem || isClosing) {
      return
    }

    setIsClosing(true)

    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setOverlayItem(null)
      setIsClosing(false)
      closeTimeoutRef.current = null
      void navigate({ to: '/explore' })
    }, 420)
  }

  const activeOverlay =
    overlayItem && originRect && targetLayout ? overlayItem : null
  const hiddenId = overlayItem?.id ?? null

  return (
    <main className="page-wrap px-4 pb-10 pt-8 hide-scrollbar">
      <div className="mb-6 flex flex-wrap gap-3 text-sm text-[var(--sea-ink-soft)]">
        {[
          '穿搭',
          '美食',
          '彩妆',
          '影视',
          '职场',
          '情感',
          '家居',
          '游戏',
          '旅行',
        ].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[var(--line)] bg-white/60 px-4 py-2"
          >
            {tag}
          </span>
        ))}
      </div>

      <section className="columns-2 gap-4 md:columns-3">
        {exploreItems.map((item) => (
          <article key={item.id} className="mb-4 inline-block w-full">
            <button
              type="button"
              onClick={() => handleOpen(item)}
              className="w-full text-left"
            >
              <div className="overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                <div
                  ref={(node) => {
                    cardRefs.current[item.id] = node
                  }}
                  className="overflow-hidden"
                  style={{
                    visibility: hiddenId === item.id ? 'hidden' : 'visible',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full object-cover"
                    style={{ height: `${item.imageHeight}px` }}
                  />
                </div>
                <div className="px-4 pb-4 pt-3 bg-white/85 ">
                  <h2 className="line-clamp-2 text-base font-semibold text-[var(--sea-ink)]">
                    {item.title}
                  </h2>
                  <div className="mt-3 flex items-center justify-between text-sm text-[var(--sea-ink-soft)]">
                    <span>{item.author}</span>
                    <span>{item.subtitle}</span>
                  </div>
                </div>
              </div>
            </button>
          </article>
        ))}
      </section>

      <AnimatePresence initial={false}>
        {activeOverlay ? (
          <div className="fixed inset-0 z-[200]">
            <motion.button
              type="button"
              aria-label="Close detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/12 backdrop-blur-[2px]"
              onClick={handleClose}
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
                    src={activeOverlay.image}
                    alt={activeOverlay.title}
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
                      <p className="text-sm text-[var(--sea-ink-soft)]">
                        {activeOverlay.author}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[var(--sea-ink)] dark:text-neutral-100">
                        {activeOverlay.title}
                      </h3>
                    </div>
                    <div className="min-h-0 flex-1 px-5 py-4">
                      <div className="h-full overflow-auto pr-1 text-sm leading-7 text-[var(--sea-ink-soft)] dark:text-neutral-300 [scrollbar-width:none] [-ms-overflow-style:none]">
                        {activeOverlay.content}
                      </div>
                    </div>
                    <div className="border-t border-black/6 px-5 py-4 text-sm text-[var(--sea-ink-soft)] dark:border-white/10 dark:text-neutral-400">
                      {activeOverlay.subtitle}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}

const exploreItems: ExploreItem[] = [
  {
    id: '1',
    author: 'Kenny做产品',
    title: '我开发的 APP，坚持零广告',
    subtitle: '收藏 65',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    imageHeight: 420,
    content:
      '作为一个独立开发者，我发现自己越来越抗拒在产品里塞满打断体验的广告位。用户点开一个工具，不是为了被拦住，而是为了尽快完成手上的目标。于是我开始反过来要求自己，功能必须足够有价值，才配让用户留下来。' +
      ' 我把每一个交互都当成一次承诺，能少一步就少一步，能不打扰就不打扰。也正因为这样，产品虽然慢一点长大，但它积累下来的每一位用户都更愿意长期使用。' +
      ' 我后来越来越确定，克制本身也是一种设计能力。真正打动人的，往往不是“加了什么”，而是你敢不敢删掉那些会破坏体验的东西。',
  },
  {
    id: '2',
    author: '山里公主',
    title: '怎么，连大学生妹妹这还差不多嘛',
    subtitle: '评论 1411',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    imageHeight: 320,
    content:
      '很多内容爆火，看起来像是一个瞬间，其实背后都是节奏感、镜头语言和情绪铺垫的结果。真正让人停留的，不只是画面够不够漂亮，而是它有没有在第一秒就建立情绪。' +
      ' 我越来越喜欢那种先给你一个轻松入口，再慢慢把故事推近的表达方式。它不会硬拽你，却会让你自己想继续看下去。',
  },
  {
    id: '3',
    author: '一只羊',
    title: '小段牙齿是会发光吗，镜头一推近就沦陷了',
    subtitle: '点赞 5277',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    imageHeight: 520,
    content:
      '氛围感内容最难的不是“拍得美”，而是让观众觉得这个瞬间是真的。背景、构图、光线都只是辅助，真正决定观感的，是人物有没有把情绪站稳。' +
      ' 一旦那个情绪是真的，哪怕只是一个普通镜头，也会让人反复回看。',
  },
  {
    id: '4',
    author: '电影碎片局',
    title: '研究表明：睡前阅读与睡前刷剧，大脑发生巨大差异',
    subtitle: '收藏 2.1w',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    imageHeight: 460,
    content:
      '输入方式会重塑人的注意力。阅读要求大脑主动组织信息，而短视频更像是被动接收连续刺激。它们没有绝对高下，但确实会把你的节奏往不同方向推。' +
      ' 如果你想让自己在晚上慢下来，给第二天留一点清醒的余地，那么睡前那二十分钟到底喂给大脑什么，会比想象中更重要。',
  },
  {
    id: '5',
    author: 'Olivia',
    title: '真笑死了，有那么夸张吗，但是你别说还挺有代入感',
    subtitle: '评论 903',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    imageHeight: 360,
    content:
      '很多好内容都不是靠信息密度取胜，而是靠一种“被懂得了”的感觉取胜。你看到一句话、一个表情、一个停顿，突然觉得它精准地戳中了你的处境，于是你会自然停下来。' +
      ' 这种共鸣很难伪造，所以越是轻描淡写，越容易打中人。',
  },
  {
    id: '6',
    author: '玩车小辣',
    title: '早餐盘看着普通，为什么镜头里反而更有食欲',
    subtitle: '点赞 3812',
    image:
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80',
    imageHeight: 300,
    content:
      '食物内容最打动人的，不是堆得多丰盛，而是质感是否真实。边缘的酥脆、蛋液的流动、瓷盘和木桌之间的反差，都会把味觉想象一点点唤起来。' +
      ' 所以好的镜头从来不只是记录食物，而是在替观众预演一口咬下去的感觉。',
  },
]
