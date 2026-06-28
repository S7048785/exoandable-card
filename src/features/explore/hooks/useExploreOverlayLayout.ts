import {useEffect, useMemo, useState} from 'react'
import type {ExploreOverlayLayout} from '../types'

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

function useViewportSize() {
	const [viewport, setViewport] = useState({width: 0, height: 0})

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

	return viewport
}

export function useExploreOverlayLayout(): ExploreOverlayLayout | null {
	const viewport = useViewportSize()

	// Keep target geometry deterministic: Motion animates numeric values more
	// predictably than mixing CSS layout transitions with JS-measured origins.
	return useMemo<ExploreOverlayLayout | null>(() => {
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
}
