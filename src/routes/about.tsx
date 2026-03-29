import ExpandableCardDemo from '#/components/expandable-card-demo-grid'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <ExpandableCardDemo></ExpandableCardDemo>
    </main>
  )
}
