import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
import './styles/redesign.css'
import './styles/interactions.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <HashRouter><App /></HashRouter>
    </MotionConfig>
  </React.StrictMode>,
)
