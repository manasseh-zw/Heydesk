import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { Providers, getContext } from './providers.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
// Create a new router instance

const TanStackQueryProviderContext = getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  defaultViewTransition: true,
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Providers {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  )
}