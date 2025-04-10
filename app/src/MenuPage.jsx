
import {react, useState, useEffect, useRef} from "react";

function MenuPage() {
    const [mode, setMode] = useState("login");
    const [countries, setCountries] = useState();
    const [registerData, setRegisterData] = useState({})

    const userExistText = useRef(null);
    const nameText = useRef(null);
    const surnameText = useRef(null);
    const passwordText = useRef(null);
    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all").then((res) => res.json()).then(data => {
            setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)).map((ele, index) => `<option key='${index}'>${ele.name.common}</option>`));
        })
    }, []);

    const checkPattern = (obj, pattern, error) => {

    }

    const checkUsername = (el) => {
        const username = el.target.value;
        userExistText.current.textContent = ""
        if(username.length > 50) {
            userExistText.current.textContent = "too long"
            return;
        }
        if(username.length > 0) {
            fetch(`/api/check_user_exist/${username}`).then(
                (res) => {
                    if(res.ok) {
                        return res.json();
                    }
                }
            ).then(data => {
                if(data.success) {
                    userExistText.current.textContent = "This username is avaiable"
                } else {
                    userExistText.current.textContent = "This username is taken"
                }
            })
        }
    }
    const checkName = (el) => {
        const name = el.target.value;
        nameText.current.textContent = ""
        if(name.length > 50) {
            nameText.current.textContent = "too long"
            return;
        }
        if(name.length == 0) {
            return;
        }
    }
    const checkSurname = (el) => {
        const surname = el.target.value;
        surnameText.current.textContent = ""
        if(surname.length > 50) {
            surnameText.current.textContent = "too long"
            return;
        }
        if(surname.length == 0) {
            return;
        }
    }
    const checkPassword = (el) => {
        const password = el.target.value;
        passwordText.current.textContent = ""
        if(password < 8) {
            passwordText.current.textContent = "minimum 8 chars"
            return;
        }
    }
    const checkRepeat = (el) => {

    }

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
                            <input type="text" placeholder="username..." />
                            <input type="password" placeholder="password..." />
                            <button>
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
                                    <input type="text" placeholder="username..." onChange={checkUsername} />
                                    <span ref={userExistText}></span>
                                </div>
                                <div>
                                    <input type="text" placeholder="name..." onChange={checkName}/>
                                    <span ref={nameText}></span>
                                </div>
                                <div>
                                    <input type="text" placeholder="surname..." onChange={checkSurname} />
                                    <span ref={surnameText}></span>
                                </div>
                                <div>
                                    <input type="date" placeholder="birthdate..." />
                                </div>
                                <div>
                                    <select dangerouslySetInnerHTML={{ __html: countries }} />
                                </div>
                                <div>
                                    <input type="email" placeholder="email..."/>
                                </div>
                                <div>
                                    <input type="password" placeholder="password..." onChange={checkPassword}/>
                                    <span ref={passwordText}></span>
                                </div>
                                <div>
                                    <input type="password" placeholder="repeat password..."/>
                                </div>
                            </div>
                            <button>
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