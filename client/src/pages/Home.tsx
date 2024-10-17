import { Button } from "@/components/ui/button"
import useAuthFacade from "@/facades/useAuthFacade";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {

  const {storeLogout,user} = useAuthFacade();

  const navigate = useNavigate();

  const name = user?.name.split(" ")[0];

  const handleLogout = () => {
    storeLogout();
    navigate("/auth/login");
  }

  useEffect(()=>{
    if(!user){
      navigate("/auth/login");
    }
  },[])

  return (
    <div className="flex justify-center items-center h-screen flex-col gap-[32px]">
      <h1 className="text-[32px] font-bold text-gray-800">Hello {name} 👋🏻,</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default Home
