import { ExploreCardList } from '@/features/explore/ExploreCard'
import { ExploreOverlay } from '@/features/explore/ExploreOverlay'
import { useExploreOverlayState } from '@/features/explore/hooks/useExploreOverlayState'
import { exploreItems } from '@/lib/data'
import { createFileRoute } from '@tanstack/react-router'

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
      <ExploreCardList
        exploreItems={exploreItems}
        hiddenId={hiddenId}
        handleOpen={handleOpen}
        registerCardNode={registerCardNode}
      />
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
