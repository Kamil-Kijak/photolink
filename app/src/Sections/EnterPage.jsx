
import { useState } from "react"
import LoginComponent from "../Components/LoginComponent"
import RegisterComponent from "../Components/RegisterComponent";

export default function EnterPage() {

    const [IsLogin, SetIsLogin] = useState(true);


    return (
    <>
        <main className="bg-gradient-to-r from-slate-900 to-slate-700 w-max-screen overflow-x-hidden min-h-screen flex flex-col items-center">
            {IsLogin ? <LoginComponent changeIsLoginStatus={() => SetIsLogin(false)}></LoginComponent> : <RegisterComponent changeIsLoginStatus={() => SetIsLogin(true)}></RegisterComponent>}
        </main>
    
    </>
    )
}