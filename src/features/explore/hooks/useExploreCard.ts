import type { ExploreItem } from '@/lib/data'

type UseExploreCardOptions = {
  item: ExploreItem
  hiddenImage: boolean
  onOpen: (item: ExploreItem) => void
  onImageRef: (id: string, node: HTMLDivElement | null) => void
}

export function useExploreCard({
  item,
  hiddenImage,
  onOpen,
  onImageRef,
}: UseExploreCardOptions) {
  function handleClick() {
    onOpen(item)
  }

  function handleImageRef(node: HTMLDivElement | null) {
    onImageRef(item.id, node)
  }

  return {
    handleClick,
    handleImageRef,
    imageVisibility: hiddenImage ? 'hidden' : 'visible',
  } as const
}
