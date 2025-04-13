
import {react, useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom"

function MenuPage({setUser}) {
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

    const [errors, setErrors] = useState({});

    const navigation = useNavigate();

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all").then((res) => res.json()).then(data => {
            setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)).map((ele, index) =>
                 `<option key='${index}' value='${ele.name.common}'>${ele.name.common}</option>`));
        })
        fetch("/api/auto_login", {
            method:"POST",
            credentials:"include"
        }).then(res => 
        {
            if(!res.ok) {
                throw new Error("failed login")
            }
            return res.json();
        }
        ).then(data => {
            if(data.success) {
                setUser(data.ID);
                navigation("/app")
            }
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
            // login
            fetch("/api/login_user", {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(loginData)
            }).then(res =>
                 {
                    if(!res.ok) {
                        return res.json();
                    }
                    return res.json()
                 }).then(data => {
                if(!data.success) {
                    setErrors(prev => ({...prev, loginError:data.message}))
                } else {
                    //success login
                    setUser(data.ID);
                    navigation("/app")
                }
            })
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
            if(!Object.keys(warnings).some((key) => {
                if(warnings[key].length > 0) {
                    return true;
                }
            })) {
                // register
                fetch("/api/register_user", {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        name:registerData.name,
                        surname:registerData.surname,
                        username:registerData.rUsername,
                        birthdate:registerData.birthdate,
                        country:registerData.country,
                        email:registerData.email,
                        password:registerData.rPassword
                    })
                }).then(res =>
                    {
                       if(!res.ok) {
                           return res.json();
                       }
                       return res.json()
                }).then(data => {
                   if(!data.success) {
                       setErrors(prev => ({...prev, registerError:data.message}))
                   } else {
                    fetch("/api/login_user", {
                        method:"POST",
                        headers:{
                            "Content-Type":"application/json"
                        },
                        body:JSON.stringify({
                            username:registerData.rUsername,
                            password:registerData.rPassword
                        })
                    }).then(res =>
                         {
                            if(!res.ok) {
                                return res.json();
                            }
                            return res.json()
                         }).then(data => {
                        if(!data.success) {
                            setErrors(prev => ({...prev, loginError:data.message}))
                        } else {
                            setUser(data.ID);
                            navigation("/app")
                        }
                    })
                   }
               })
            }
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
                            <span>{errors.loginError}</span>
                        </section>
                        <section>
                            <span>dont have an account?</span>
                            <button onClick={() => {setMode("register");setRegisterData(
                                {
                                    rUsername:"",
                                    name:"",
                                    surname:"",
                                    birthdate:"",
                                    email:"",
                                    country:"",
                                    rPassword:"",
                                    rPassword2:""
                                }
                            );
                            setWarnings({});
                            setErrors({})}}>Register</button>
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
                                                if(!res) {
                                                    setWarnings(prev => ({...prev, rUsername:"app error"}))
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
                                    <input type="text" placeholder="name..." onChange={(e) => {
                                        setRegisterData(prev => ({...prev, name:e.target.value}))
                                        if(e.target.value.length > 50) {
                                            setWarnings(prev => ({...prev, name:"name too long"}))
                                        } else {
                                            setWarnings(prev => ({...prev, name:""}))
                                        }
                                    }
                                        
                                    }/>
                                    <span>{warnings.name}</span>
                                </div>
                                <div>
                                    <input type="text" placeholder="surname..." onChange={(e) => {
                                        setRegisterData(prev => ({...prev, surname:e.target.value}))
                                        if(e.target.value.length > 50) {
                                            setWarnings(prev => ({...prev, surname:"surname too long"}))
                                        } else {
                                            setWarnings(prev => ({...prev, surname:""}))
                                        }
                                    }
                                        
                                    }/>
                                    <span>{warnings.surname}</span>
                                </div>
                                <div>
                                    <input type="date" placeholder="birthdate..."  onChange={
                                        (e) => 
                                            {
                                                setRegisterData(prev => ({...prev, birthdate:e.target.value}))
                                                setWarnings(prev => ({...prev, birthdate:""}))
                                            }
                                    }/>
                                    <span>{warnings.birthdate}</span>
                                </div>
                                <div>
                                    <select dangerouslySetInnerHTML={{ __html: countries }} value={registerData.country} onChange={
                                        (e) => 
                                            {
                                                setRegisterData(prev => ({...prev, country:e.target.value}))
                                                setWarnings(prev => ({...prev, country:""}))
                                            }
                                    }/>
                                </div>
                                <div>
                                    <input type="email" placeholder="email..." onChange={(e) => {
                                        setRegisterData(prev => ({...prev, email:e.target.value}))
                                        if(e.target.value.length > 50) {
                                            setWarnings(prev => ({...prev, email:"email too long"}))
                                        } else {
                                            setWarnings(prev => ({...prev, email:""}))
                                        }
                                    }
                                        
                                    }/>
                                    {warnings.email}
                                </div>
                                <div>
                                    <input type="password" placeholder="password..." onChange={(e) => {
                                        setRegisterData(prev => ({...prev, rPassword:e.target.value}))
                                        if(e.target.value.length >= 8) {
                                            setWarnings(prev => ({...prev, rPassword:""}))
                                        } else {
                                            setWarnings(prev => ({...prev, rPassword:"password is too short"}))
                                        }
                                    }
                                        
                                    }/> 
                                    <span>{warnings.rPassword}</span>
                                </div>
                                <div>
                                    <input type="password" placeholder="repeat password..." onChange={(e) => {
                                        setRegisterData(prev => ({...prev, rPassword2:e.target.value}))
                                        if(registerData.rPassword === e.target.value) {
                                            setWarnings(prev => ({...prev, rPassword2:""}))
                                        } else {
                                            setWarnings(prev => ({...prev, rPassword2:"passwords are not same"}))
                                        }
                                    }
                                        
                                    }/>
                                    <span>{warnings.rPassword2}</span>
                                </div>
                            </div>
                            <button onClick={registerUser}>
                                Create new account
                            </button>
                            <span>{errors.registerError}</span>
                        </section>
                        <section>
                            <span>have an account?</span>
                            <button onClick={() => {setMode("login");setLoginData(
                                {
                                    username:"",
                                    password:""
                                }
                            );
                            setWarnings({});
                            setErrors({})}}>Login</button>
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