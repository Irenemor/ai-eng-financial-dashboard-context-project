import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartErrorBoundaryProps {
  title: string
  children: ReactNode
}

interface ChartErrorBoundaryState {
  failed: boolean
}

export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Failed to load or render ${this.props.title}:`, error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">{this.props.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p role="alert">Unable to load this chart. Please refresh the page.</p>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
