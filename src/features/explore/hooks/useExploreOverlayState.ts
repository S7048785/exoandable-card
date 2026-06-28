import type {ExploreItem} from '@/lib/data'
import {useNavigate, useRouter, useRouterState} from '@tanstack/react-router'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {RectLike} from '../types'
import {useBodyScrollLock} from './useBodyScrollLock'
import {useExploreCardRegistry} from './useExploreCardRegistry'
import {useExploreOverlayLayout} from './useExploreOverlayLayout'

type UseExploreOverlayStateOptions = {
  items: ExploreItem[]
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

  const {registerCardNode, getCardRect} = useExploreCardRegistry()
  const targetLayout = useExploreOverlayLayout()
  const isOpeningRef = useRef(false)
  const overlayItemRef = useRef<ExploreItem | null>(null)
  const [overlayItem, setOverlayItem] = useState<ExploreItem | null>(null)
  const [originRect, setOriginRect] = useState<RectLike | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  // Keep the latest overlay item available to stable callbacks without
  // forcing them to depend on frequently changing render state.
  useEffect(() => {
    overlayItemRef.current = overlayItem
  }, [overlayItem])

  useBodyScrollLock(Boolean(overlayItem))

  const beginClose = useCallback(() => {
    if (!overlayItemRef.current) {
      return
    }

    setIsClosing((current) => current || true)
  }, [])

  const handleCloseAnimationComplete = useCallback(() => {
    setOverlayItem(null)
    setOriginRect(null)
    setIsClosing(false)
    isOpeningRef.current = false
  }, [])

  // The URL is the public state. The local overlay state is kept around during
  // close animation so the card can animate back before React removes it.
  useEffect(() => {
    if (!activeItem) {
      if (isOpeningRef.current) {
        return
      }

      beginClose()
      return
    }

    setOverlayItem(activeItem)
    setIsClosing(false)
    isOpeningRef.current = false

    // Measure on the next frame after route state settles, so the source card
    // rect matches what the user currently sees on screen.
    const frame = window.requestAnimationFrame(() => {
      const rect = getCardRect(activeItem.id)
      if (!rect) {
        return
      }

      setOriginRect(rect)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeItem, beginClose, getCardRect])

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

  const handleOpen = useCallback(
      (item: ExploreItem) => {
        // Capture the FLIP starting rect before navigation changes the route.
        const rect = getCardRect(item.id)
        if (!rect) {
          return
        }

        setOriginRect(rect)
        isOpeningRef.current = true
        setOverlayItem(item)
        setIsClosing(false)

        void navigate({
          to: '/explore/$id',
          params: {id: item.id},
          resetScroll: false,
        })
      },
      [getCardRect, navigate],
  )

  return {
    hiddenId: overlayItem?.id ?? null,
    registerCardNode,
    handleOpen,
    handleClose,
    handleCloseAnimationComplete,
    activeOverlay:
      overlayItem && originRect && targetLayout ? overlayItem : null,
    originRect,
    targetLayout,
    isClosing,
  } as const
}
