'use no memo'

import {
  Link,
  createFileRoute,
  useMatchRoute,
  useNavigate,
} from '@tanstack/react-router'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { useEffect, useId, useState } from 'react'

export const Route = createFileRoute('/posts')({
  component: RouteComponent,
})

function RouteComponent() {
  const id = useId()
  const matchRoute = useMatchRoute()
  const navigate = useNavigate()
  const detailMatch =
    matchRoute({ to: '/posts/$postId', pending: true }) ||
    matchRoute({ to: '/posts/$postId' })
  const activeCard = detailMatch
    ? (cards.find((card) => card.id === detailMatch.postId) ?? null)
    : null
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null)

  useEffect(() => {
    if (activeCard) {
      setHiddenCardId(activeCard.id)
    } else {
      const timeoutId = window.setTimeout(() => {
        setHiddenCardId(null)
      }, 100)

      return () => window.clearTimeout(timeoutId)
    }
  }, [activeCard])

  useEffect(() => {
    if (!activeCard) {
      document.body.style.overflow = 'auto'
      return
    }

    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        void navigate({ to: '/posts' })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeCard, navigate])

  return (
    <LayoutGroup id={`posts-${id}`}>
      <div className="max-w-2xl mx-auto w-full p-4">
        <AnimatePresence initial={false}>
          {activeCard ? (
            <motion.button
              type="button"
              aria-label="Close post detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => void navigate({ to: '/posts' })}
            />
          ) : null}
        </AnimatePresence>

        <ul className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
          {cards.map((card) => (
            <li key={card.id}>
              <Link
                to="/posts/$postId"
                preload="viewport"
                viewTransition
                params={{ postId: card.id }}
                className="cursor-pointer block"
              >
                <motion.div
                  layoutId={`card-${card.id}-${id}`}
                  animate={{ opacity: hiddenCardId === card.id ? 0 : 1 }}
                  transition={{ opacity: { duration: 0.15 } }}
                  className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  <div className="flex gap-4 flex-col w-full">
                    <motion.div layoutId={`image-${card.id}-${id}`}>
                      <img
                        src={card.src}
                        alt={card.title}
                        className="h-60 w-full rounded-lg object-cover object-top"
                      />
                    </motion.div>
                    <div className="flex justify-center items-center flex-col">
                      <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base">
                        {card.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>

        <AnimatePresence initial={false}>
          {activeCard ? (
            <div className="fixed inset-0 z-50 mx-auto  grid place-items-center p-4 pointer-events-none ">
              <motion.div
                layoutId={`card-${activeCard.id}-${id}`}
                exit={{ width: '30%', height: 240 }}
                className="pointer-events-auto size-[80%] flex flex-col md:flex-row bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden shadow-2xl"
              >
                <motion.div
                  layoutId={`image-${activeCard.id}-${id}`}
                  className="h-full w-1/2"
                >
                  <img
                    src={activeCard.src}
                    alt={activeCard.title}
                    className="size-full object-cover object-top"
                  />
                </motion.div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start p-4">
                    <div>
                      <h3 className="font-medium text-neutral-700 dark:text-neutral-200 text-base">
                        {activeCard.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-base">
                        {activeCard.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 relative px-4">
                    <div className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]">
                      {activeCard.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}

export const cards = [
  {
    id: '1',
    description: 'Lana Del Rey',
    title: 'Summertime Sadness',
    src: 'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
    content:
      'Lana Del Rey, an iconic American singer-songwriter, is celebrated for her melancholic and cinematic music style. Born Elizabeth Woolridge Grant in New York City, she has captivated audiences worldwide with her haunting voice and introspective lyrics. Her songs often explore themes of tragic romance, glamour, and melancholia, drawing inspiration from both contemporary and vintage pop culture.',
  },
  {
    id: '2',
    description: 'Babbu Maan',
    title: 'Mitran Di Chhatri',
    src: 'https://assets.aceternity.com/demos/babbu-maan.jpeg',
    content:
      'Babu Maan, a legendary Punjabi singer, is renowned for his soulful voice and profound lyrics that resonate deeply with his audience. Born in the village of Khant Maanpur in Punjab, India, he has become a cultural icon in the Punjabi music industry. His songs often reflect the struggles and triumphs of everyday life, capturing the essence of Punjabi culture and traditions.',
  },
  {
    id: '3',
    description: 'Metallica',
    title: 'For Whom The Bell Tolls',
    src: 'https://assets.aceternity.com/demos/metallica.jpeg',
    content:
      'Metallica, an iconic American heavy metal band, is renowned for their powerful sound and intense performances that resonate deeply with their audience. Formed in Los Angeles, California, they have become a cultural icon in the heavy metal music industry. Their songs often reflect themes of aggression, social issues, and personal struggles.',
  },
  {
    id: '4',
    description: 'Lord Himesh',
    title: 'Aap Ka Suroor',
    src: 'https://assets.aceternity.com/demos/aap-ka-suroor.jpeg',
    content:
      'Himesh Reshammiya, a renowned Indian music composer, singer, and actor, is celebrated for his distinctive voice and innovative compositions. Born in Mumbai, India, he has become a prominent figure in the Bollywood music industry. His songs feature a blend of contemporary and traditional Indian music.',
  },
]
