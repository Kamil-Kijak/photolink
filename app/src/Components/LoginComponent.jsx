
import icon from "../../images/icon.png"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser} from "@fortawesome/free-solid-svg-icons"
import {faLock} from "@fortawesome/free-solid-svg-icons"
import {faCircleExclamation} from "@fortawesome/free-solid-svg-icons"
import {faCircleCheck} from "@fortawesome/free-solid-svg-icons"

import {InputBox} from "../Elements/Input"

export default function LoginComponent({changeIsLoginStatus}) {


    return (
        <>
            <img src={icon} alt="icon" width={100} className="mt-20"/>
            <h1 className="text-white font-extrabold text-2xl">Log in to your account</h1>
            <section className="flex flex-col items-center my-10 gap-5">
                <InputBox
                title={<><FontAwesomeIcon icon={faUser}></FontAwesomeIcon> username</>}
                placeholder={"username..."}
                styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-100"}
                success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> correct</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> incorrect</p>}
                regexp={/^\w{1,50}$/}
                ></InputBox>
                <InputBox
                title={<><FontAwesomeIcon icon={faLock}></FontAwesomeIcon> password</>}
                type={"password"}
                placeholder={"password..."}
                styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-100"}
                success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> correct</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> too short</p>}
                regexp={/^\w{8,}$/}
                ></InputBox>
            </section>
            <button className="w-auto mb-10 h-auto bg-blue-800 text-2xl text-white font-bold
                     px-6 py-4 rounded-lg hover:bg-blue-700 hover:cursor-pointer transition-colors duration-200">Log in</button>
            <button onClick={changeIsLoginStatus} className="w-auto mb-10 h-auto bg-black text-md text-white font-bold
                     px-6 py-4 rounded-lg hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200">don't have account?</button>
        </>
    )
}