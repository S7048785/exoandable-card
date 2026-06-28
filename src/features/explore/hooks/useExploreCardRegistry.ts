import {useCallback, useRef} from 'react'
import type {RectLike} from '../types'

export function useExploreCardRegistry() {
	const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

	// Store only image wrapper nodes. The overlay starts from the visible image
	// area, not from the full card including text metadata.
	const registerCardNode = useCallback(
			(id: string, node: HTMLDivElement | null) => {
				cardRefs.current[id] = node
			},
			[],
	)

	// Convert DOMRect into a plain object before storing it in React state.
	const getCardRect = useCallback((id: string): RectLike | null => {
		const node = cardRefs.current[id]
		if (!node) {
			return null
		}

		const rect = node.getBoundingClientRect()
		return {
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		}
	}, [])

	return {registerCardNode, getCardRect} as const
}
