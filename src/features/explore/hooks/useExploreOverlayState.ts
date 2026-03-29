import type { ExploreItem } from '@/lib/data'
import {
  useNavigate,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type RectLike = {
  top: number
  left: number
  width: number
  height: number
}

export type ExploreOverlayLayout = {
  top: number
  left: number
  width: number
  height: number
  imageWidth: number
  imageHeight: number
  panelWidth: number
  panelHeight: number
  isMobile: boolean
}

type UseExploreOverlayStateOptions = {
  items: ExploreItem[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function useExploreOverlayState({
  items,
}: UseExploreOverlayStateOptions) {
  const navigate = useNavigate()
  const router = useRouter()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const detailId = useMemo(() => {
    const match = /^\/explore\/([^/]+)$/.exec(pathname)
    if (!match) {
      return null
    }

    return decodeURIComponent(match[1])
  }, [pathname])
  const activeItem = detailId
    ? (items.find((item) => item.id === detailId) ?? null)
    : null

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const closeTimeoutRef = useRef<number | null>(null)
  const isOpeningRef = useRef(false)
  const [overlayItem, setOverlayItem] = useState<ExploreItem | null>(null)
  const [originRect, setOriginRect] = useState<RectLike | null>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [isClosing, setIsClosing] = useState(false)

  const beginClose = useCallback(() => {
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
    }, 420)
  }, [isClosing, overlayItem])

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
      if (isOpeningRef.current) {
        return
      }

      beginClose()

      return
    }

    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setOverlayItem(activeItem)
    setIsClosing(false)
    isOpeningRef.current = false

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
  }, [activeItem, beginClose, isClosing, overlayItem])

  const handleClose = useCallback(() => {
    if (!overlayItem || isClosing) {
      return
    }

    isOpeningRef.current = false
    beginClose()

    void router.navigate({
      to: '/explore',
      resetScroll: false,
    })
  }, [beginClose, isClosing, overlayItem, router])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && overlayItem && !isClosing) {
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleClose, isClosing, overlayItem])

  const targetLayout = useMemo<ExploreOverlayLayout | null>(() => {
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

  function registerCardNode(id: string, node: HTMLDivElement | null) {
    cardRefs.current[id] = node
  }

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
    isOpeningRef.current = true
    setOverlayItem(item)
    setIsClosing(false)

    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    void navigate({
      to: '/explore/$id',
      params: { id: item.id },
      resetScroll: false,
    })
  }

  return {
    hiddenId: overlayItem?.id ?? null,
    registerCardNode,
    handleOpen,
    handleClose,
    activeOverlay:
      overlayItem && originRect && targetLayout ? overlayItem : null,
    originRect,
    targetLayout,
    isClosing,
  } as const
}
