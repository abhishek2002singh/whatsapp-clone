import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import appStore from './utils/appStore.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={appStore}>
        <App />
      </Provider>
      <ToastContainer autoClose={1000}/>
    </BrowserRouter>
  </StrictMode>,

)
