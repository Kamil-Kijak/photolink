
import icon from "../../images/icon.png"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser} from "@fortawesome/free-solid-svg-icons"
import {faBirthdayCake} from "@fortawesome/free-solid-svg-icons"
import {faEarthEurope} from "@fortawesome/free-solid-svg-icons"
import {faEnvelope} from "@fortawesome/free-solid-svg-icons"
import {faMarsAndVenus} from "@fortawesome/free-solid-svg-icons"
import {faLock} from "@fortawesome/free-solid-svg-icons"
import {faCircleExclamation} from "@fortawesome/free-solid-svg-icons"
import {faCircleCheck} from "@fortawesome/free-solid-svg-icons"

import {InputBox, InputSelect} from "../Elements/Input"
import { useCallback, useEffect, useState } from "react"

export default function RegisterComponent({changeIsLoginStatus}) {

    const [countries, SetCountries] = useState([]);

    const [data, SetData] = useState({
        "password": "",
        "passwordRepeated":""
    });
    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all").then(res => res.json()).then(data => {
            SetCountries(data.map((element) => ({"key":element.name.official, "value":element.name.common})).sort((a, b) => a.value.localeCompare(b.value)));
        });
    }, []);


    return (
        <>
            <img src={icon} alt="icon" width={100} className="mt-20"/>
            <h1 className="text-white font-extrabold text-2xl">Create new account</h1>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8 lg:place-items-center items-stretch">
                <InputBox
                 title={<><FontAwesomeIcon icon={faUser}></FontAwesomeIcon> username</>}
                 placeholder={"username..."}
                 styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                 success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> correct username</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> incorrect</p>}
                regexp={/^\w{1,50}$/}
                 ></InputBox>
                 <InputBox
                 title={<><FontAwesomeIcon icon={faUser}></FontAwesomeIcon> name</>}
                 placeholder={"name..."}
                 styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                 success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> correct name</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> only letters, starts with big</p>}
                regexp={/^[A-Z][a-z]{0,50}$/}
                 ></InputBox>
                  <InputBox
                 title={<><FontAwesomeIcon icon={faUser}></FontAwesomeIcon> surname</>}
                 placeholder={"surname..."}
                 styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                 success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> correct surname</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> only letters, starts with big</p>}
                regexp={/^[A-Z][a-z]{0,50}$/}
                 ></InputBox>
                  <InputBox
                 title={<><FontAwesomeIcon icon={faBirthdayCake}></FontAwesomeIcon> birthdate</>}
                 placeholder={"birthdate..."}
                 styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                 type={"date"}
                 success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> correct date</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> incorect date</p>}
                 ></InputBox>
                <InputSelect
                title={<><FontAwesomeIcon icon={faEarthEurope}></FontAwesomeIcon> country</>}
                placeholder={"Select a country"}
                styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                optionDict={
                    countries
                }
                ></InputSelect>
                <InputSelect
                title={<><FontAwesomeIcon icon={faMarsAndVenus}></FontAwesomeIcon> gender</>}
                placeholder={"Select a gender"}
                styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                optionDict={
                    [
                        {"key":"Male", "value": "Male"},
                        {"key":"Female", "value": "Female"},
                        {"key":"Other", "value": "Other gender"}
                    ]
                }
                ></InputSelect>
                <InputBox
                 title={<><FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon> email adress</>}
                 placeholder={"email..."}
                 styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                 type={"email"}
                 success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> correct adress</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> invalid adress format</p>}
                regexp={/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/}
                 ></InputBox>
                  <InputBox
                 title={<><FontAwesomeIcon icon={faLock}></FontAwesomeIcon> password</>}
                 placeholder={"password..."}
                 styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                 type={"password"}
                 success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> strong password</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> too week</p>}
                regexp={/^\w{8,}$/}
                returnValueCallback={(value) => {SetData(prev => ({ ...prev, password: value }))}}
                 ></InputBox>
                  <InputBox
                 title={<><FontAwesomeIcon icon={faLock}></FontAwesomeIcon> repeat password</>}
                 placeholder={"repeat password..."}
                 styles={"bg-black font-bold text-white focus:bg-gray-900 px-2 py-3 rounded-md w-full"}
                 type={"password"}
                 success={<p className="text-green-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleCheck} /> passwords are the same</p>}
                error={<p className="text-red-700 font-bold ml-1"><FontAwesomeIcon icon={faCircleExclamation} /> passwords arent the same</p>}
                returnValueCallback={(value) => {SetData(prev => ({ ...prev, passwordRepeated: value }))}}
                regexp={data.password == data.passwordRepeated ? /^\w+$/ : /\w{1,1}$\w^/}
                 ></InputBox>
            </section>
            <button className="w-auto mb-10 h-auto bg-blue-800 text-2xl text-white font-bold
                     px-6 py-4 rounded-lg hover:bg-blue-700 hover:cursor-pointer transition-colors duration-200">create new account</button>
            <button onClick={changeIsLoginStatus} className="w-auto mb-10 h-auto bg-black text-md text-white font-bold
                     px-6 py-4 rounded-lg hover:bg-gray-900 hover:cursor-pointer transition-colors duration-200">already have a account</button>
        </>
    )
}