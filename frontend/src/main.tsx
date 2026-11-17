import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { fetchFinancialData } from './lib/financial-api'

const financialData = fetchFinancialData()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App financialData={financialData} />
  </StrictMode>,
)
