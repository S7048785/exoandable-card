import type { ExploreItem } from '@/lib/data'
import { exploreItems } from '@/lib/data'
import { ExploreCard } from '@/features/explore/ExploreCard'
import { ExploreOverlay } from '@/features/explore/ExploreOverlay'
import { useExploreOverlayState } from '@/features/explore/hooks/useExploreOverlayState'
import {
  createFileRoute,
} from '@tanstack/react-router'

export const Route = createFileRoute('/explore')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    hiddenId,
    registerCardNode,
    handleOpen,
    handleClose,
    activeOverlay,
    originRect,
    targetLayout,
    isClosing,
  } = useExploreOverlayState({
    items: exploreItems,
  })

  return (
    <main className="page-wrap px-4 pb-10 pt-8 hide-scrollbar">
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

      <ExploreOverlay
        item={activeOverlay}
        originRect={originRect}
        targetLayout={targetLayout}
        isClosing={isClosing}
        onClose={handleClose}
      />
    </main>
  )
}
