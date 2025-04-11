
import {react, useState, useEffect, useCallback} from "react";

function MenuPage() {
    const [mode, setMode] = useState("login");
    const [countries, setCountries] = useState();
    const [registerData, setRegisterData] = useState({
        rUsername:"",
        name:"",
        surname:"",
        birthdate:"",
        email:"",
        country:"",
        rPassword:"",
        rPassword2:""
    })
    const [loginData, setLoginData] = useState({
        username:"",
        password:""
    })
    const [warnings, setWarnings] = useState({})

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all").then((res) => res.json()).then(data => {
            setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)).map((ele, index) =>
                 `<option key='${index}' value='${ele.name.common}'>${ele.name.common}</option>`));
        })
    }, []);

    const loginUser = useCallback(() => {
        let allData = true;
        Object.keys(loginData).forEach((key) => {
            if(!loginData[key].length != 0) {
                allData = false;
                setWarnings(prev => ({...prev, [key]:"enter a data"}))
            }
        })
        if(allData) {

        }

    }, [loginData, warnings]);
    const registerUser = useCallback(() => {
        let allData = true;
        Object.keys(registerData).forEach((key) => {
            if(!registerData[key].length != 0) {
                allData = false;
                setWarnings(prev => ({...prev, [key]:"enter a data"}))
            }
        })
        if(allData) {

        }
    }, [registerData, warnings])

    return (
        <main>
            <section>
                <div>
                    <img src="" alt="" />
                    <span>Photolink</span>
                </div>
                <div>
                    <span>Explore memories, extend passion and new view</span>
                </div>
                {
                    mode === "login" ? 
                    <div>
                        <section>
                            <span>Login to photolink</span>
                            <div>
                                <input type="text" placeholder="username..." onChange={(e) => {
                                    setLoginData(prev => ({...prev, username:e.target.value}))
                                    setWarnings(prev => ({...prev, username:""}))
                                }}/>
                                <span>{warnings.username}</span>
                            </div>
                            <div>
                                <input type="password" placeholder="password..." onChange={(e) => {
                                    setLoginData(prev => ({...prev, password:e.target.value}))
                                    setWarnings(prev => ({...prev, password:""}))
                                }}/>
                                <span>{warnings.password}</span>
                            </div>
                            <button onClick={loginUser}>
                                Login to account
                            </button>
                        </section>
                        <section>
                            <span>dont have an account?</span>
                            <button onClick={() => {setMode("register")}}>Register</button>
                        </section>
                    </div>
                    :
                    <div>
                        <section>
                            <span>Register to photolink</span>
                            <div>
                                <div>
                                    <input type="text" placeholder="username..." onChange={(e) => {
                                        setRegisterData(prev => ({...prev, rUsername:e.target.value}))
                                        if(e.target.value.length != 0) {
                                            fetch(`/api/check_user_exist/${e.target.value}`).then(res => {
                                                if(!res.ok) {
                                                    throw new Error('Network response was not ok');
                                                }
                                                return res.json();
                                            }).then(data => {
                                                if(!data.success) {
                                                    setWarnings(prev => ({...prev, rUsername:"this username is already taken"}))
                                                } else {
                                                    setWarnings(prev => ({...prev, rUsername:""}))
                                                }
                                            })
                                        }
                                    }}/>
                                    <span>{warnings.rUsername}</span>
                                </div>
                                <div>
                                    <input type="text" placeholder="name..."/>
                                    <span>{warnings.name}</span>
                                </div>
                                <div>
                                    <input type="text" placeholder="surname..." />
                                    <span>{warnings.surname}</span>
                                </div>
                                <div>
                                    <input type="date" placeholder="birthdate..."  onChange={
                                        (e) => setRegisterData(prev => ({...prev, birthdate:e.target.value}))
                                    }/>
                                    <span>{warnings.birthdate}</span>
                                </div>
                                <div>
                                    <select dangerouslySetInnerHTML={{ __html: countries }} onChange={
                                        (e) => setRegisterData(prev => ({...prev, country:e.target.value}))
                                    }/>
                                </div>
                                <div>
                                    <input type="email" placeholder="email..."/>
                                    {warnings.email}
                                </div>
                                <div>
                                    <input type="password" placeholder="password..."/>
                                    <span>{warnings.rPassword}</span>
                                </div>
                                <div>
                                    <input type="password" placeholder="repeat password..."/>
                                    <span>{warnings.rPassword2}</span>
                                </div>
                            </div>
                            <button onClick={registerUser}>
                                Create new account
                            </button>
                        </section>
                        <section>
                            <span>have an account?</span>
                            <button onClick={() => {setMode("login")}}>Login</button>
                        </section>
                    </div>
                }
            </section>
            <section>
                <div>
                    
                </div>
            </section>
        </main>
    )
}

export default MenuPage