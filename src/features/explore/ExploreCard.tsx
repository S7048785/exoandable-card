import type { ExploreItem } from '@/lib/data'
import { useExploreCard } from './hooks/useExploreCard'

type ExploreCardProps = {
  item: ExploreItem
  hiddenImage: boolean
  onOpen: (item: ExploreItem) => void
  onImageRef: (id: string, node: HTMLDivElement | null) => void
}

export function ExploreCard({
  item,
  hiddenImage,
  onOpen,
  onImageRef,
}: ExploreCardProps) {
  const { handleClick, handleImageRef, imageVisibility } = useExploreCard({
    item,
    hiddenImage,
    onOpen,
    onImageRef,
  })

  return (
    <article className="mb-4 inline-block w-full">
      <button type="button" onClick={handleClick} className="w-full text-left">
        <div className="overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm">
          <div
            ref={handleImageRef}
            className="overflow-hidden"
            style={{ visibility: imageVisibility }}
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
