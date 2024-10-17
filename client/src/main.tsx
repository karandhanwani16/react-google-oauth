import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Bounce, ToastContainer } from 'react-toastify';
// Create a client
import 'react-toastify/dist/ReactToastify.css';
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
    </QueryClientProvider>
  ,
)
