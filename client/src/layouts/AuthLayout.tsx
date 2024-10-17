import { Outlet } from "react-router-dom";

export default function authentication() {
    return (
        <div className="w-full lg:h-[100vh] lg:flex">
            <div className="lg:w-[60%] flex items-center justify-center">
                <Outlet />
            </div>
            <div className="hidden bg-red-200 lg:block w-[40%] h-[100%]">
                <img className="w-full h-full object-cover" src="https://placehold.co/600x1000" />
            </div>
        </div>
    )
}