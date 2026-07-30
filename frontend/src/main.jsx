import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroUIProvider } from "@heroui/react"
import { BrowserRouter, useNavigate, useHref } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

function AppProvider({ children }) {
  const navigate = useNavigate();
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      {children}
    </HeroUIProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <main className="dark text-foreground bg-background min-h-screen">
          <App />
        </main>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
