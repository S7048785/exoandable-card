import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/posts')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-2xl mx-auto w-full p-4">
      <ul className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
        {cards.map((card, index) => (
          <li key={card.id}>
            <Link
              to="/posts/$postId"
              params={{ postId: String(index + 1) }}
              className="cursor-pointer block"
            >
              <motion.div
                layoutId={`card-${card.id}`}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl"
              >
                <motion.div layoutId={`image-${card.id}`}>
                  <img
                    src={card.src}
                    alt={card.title}
                    className="rounded-lg object-cover object-top"
                  />
                </motion.div>
              </motion.div>
              <div className="flex justify-center items-center flex-col mt-4">
                <h3
                  // layoutId={`title-${card.id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                >
                  {card.title}
                </h3>
                <p
                  // layoutId={`description-${card.id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base mt-1"
                >
                  {card.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* 渲染详情页 Modal */}
      <Outlet />
    </div>
  )
}

export const cards = [
  {
    id: 1,
    description: 'Lana Del Rey',
    title: 'Summertime Sadness',
    src: 'https://assets.aceternity.com/demos/lana-del-rey.jpeg',
    content:
      'Lana Del Rey, an iconic American singer-songwriter, is celebrated for her melancholic and cinematic music style. Born Elizabeth Woolridge Grant in New York City, she has captivated audiences worldwide with her haunting voice and introspective lyrics. Her songs often explore themes of tragic romance, glamour, and melancholia, drawing inspiration from both contemporary and vintage pop culture.',
  },
  {
    id: 2,
    description: 'Babbu Maan',
    title: 'Mitran Di Chhatri',
    src: 'https://assets.aceternity.com/demos/babbu-maan.jpeg',
    content:
      'Babu Maan, a legendary Punjabi singer, is renowned for his soulful voice and profound lyrics that resonate deeply with his audience. Born in the village of Khant Maanpur in Punjab, India, he has become a cultural icon in the Punjabi music industry. His songs often reflect the struggles and triumphs of everyday life, capturing the essence of Punjabi culture and traditions.',
  },
  {
    id: 3,
    description: 'Metallica',
    title: 'For Whom The Bell Tolls',
    src: 'https://assets.aceternity.com/demos/metallica.jpeg',
    content:
      'Metallica, an iconic American heavy metal band, is renowned for their powerful sound and intense performances that resonate deeply with their audience. Formed in Los Angeles, California, they have become a cultural icon in the heavy metal music industry. Their songs often reflect themes of aggression, social issues, and personal struggles.',
  },
  {
    id: 4,
    description: 'Lord Himesh',
    title: 'Aap Ka Suroor',
    src: 'https://assets.aceternity.com/demos/aap-ka-suroor.jpeg',
    content:
      'Himesh Reshammiya, a renowned Indian music composer, singer, and actor, is celebrated for his distinctive voice and innovative compositions. Born in Mumbai, India, he has become a prominent figure in the Bollywood music industry. His songs feature a blend of contemporary and traditional Indian music.',
  },
]
