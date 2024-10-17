import AuthCallback from "./components/authentication/AuthCallback";
import AuthLayout from "./layouts/AuthLayout";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SignUp from '@/pages/SignUp';
import Home from "@/pages/Home";
import Login from "@/pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Home />} />



        <Route path="/auth/" element={<AuthLayout />}>
          <Route path="login" Component={Login} />
          <Route path="signup" Component={SignUp} />
          <Route path="google/callback" element={<AuthCallback />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
