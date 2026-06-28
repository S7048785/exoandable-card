import type {ExploreItem} from '@/lib/data'
import {memo, useCallback} from 'react'

type ExploreCardProps = {
  item: ExploreItem
  hiddenImage: boolean
  onOpen: (item: ExploreItem) => void
  onImageRef: (id: string, node: HTMLDivElement | null) => void
}
type ExploreCardListProps = {
  exploreItems: ExploreItem[]
  hiddenId: string | null
  handleOpen: (item: ExploreItem) => void
  registerCardNode: (id: string, node: HTMLDivElement | null) => void
}

export function ExploreCardList({
  exploreItems,
  hiddenId,
  handleOpen,
  registerCardNode,
}: ExploreCardListProps) {
  return (
    <section className="columns-2 gap-4 md:columns-3">
      {exploreItems.map((item) => (
        <ExploreCard
          key={item.id}
          item={item}
          hiddenImage={hiddenId === item.id}
          onOpen={handleOpen}
          onImageRef={registerCardNode}
        />
      ))}
    </section>
  )
}

function ExploreCardComponent({
  item,
  hiddenImage,
  onOpen,
  onImageRef,
}: ExploreCardProps) {
  const handleClick = useCallback(() => {
    onOpen(item)
  }, [item, onOpen])

  const handleImageRef = useCallback(
      (node: HTMLDivElement | null) => {
        onImageRef(item.id, node)
      },
      [item.id, onImageRef],
  )

  return (
    <article className="mb-4 inline-block w-full">
      <button type="button" onClick={handleClick} className="w-full text-left">
        <div className="overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <div
            ref={handleImageRef}
            className="overflow-hidden"
            style={{visibility: hiddenImage ? 'hidden' : 'visible'}}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full object-cover"
              style={{ height: `${item.imageHeight}px` }}
            />
          </div>
          <div className="bg-white/85 px-4 pb-4 pt-3">
            <h2 className="line-clamp-2 text-base font-semibold text-(--sea-ink)">
              {item.title}
            </h2>
            <div className="mt-3 flex items-center justify-between text-sm text-(--sea-ink-soft)">
              <span>{item.author}</span>
              <span>{item.subtitle}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  )
}

export const ExploreCard = memo(ExploreCardComponent)
