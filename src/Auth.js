import React, { useState } from "react";
import { useNavigate } from "react-router";
import { backend } from "./App";
import './App.css';

function Auth() {
    const [type, setType] = useState("sign in")
    const [message, setMessage] = useState("")
    const navigate = useNavigate()

    async function Refresh() {
        const response = await fetch(`${backend}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({refresh: localStorage.getItem("refresh_token")})
        })
        const data = await response.json()
        if (response.status == 200) {
            console.log("dildo")
            localStorage.setItem("access_token", data.access)
            localStorage.setItem("refresh_token", data.refresh)
            navigate("/teams")
        }
    }
    if (localStorage.getItem("refresh_token") != null && localStorage.getItem("refresh_token") != undefined) {
        console.log("falos epta")
        Refresh()
    }
    if (type == "sign in") {
        return(
            <div>
                <h2>{message}</h2>
                <img style={{width: '50vw', maxWidth: 300, marginTop: '10vh'}} src="https://raw.githubusercontent.com/lavatee/facepalm/refs/heads/main/img/eachother.png"/>
                <input style={{marginTop: '3vh'}} placeholder="Почта" id="sign_in_email"/>
                <input style={{marginTop: '3vh'}} placeholder="Пароль" id="sign_in_password"/>
                <button style={{marginTop: '3vh'}} onClick={() => SignIn(navigate)}>Войти</button>
                <button style={{marginTop: '3vh'}} onClick={() => {
                    setType("sign up")
                    document.getElementById("sign_in_email").value = ""
                    document.getElementById("sign_in_password").value = ""
                }}>Создать аккаунт</button>
            </div>
        )
    }
    if (type == "sign up") {
        return(
            <div>
                <h2>{message}</h2>
                <img style={{width: '50vw', maxWidth: 300, marginTop: '10vh'}} src="https://raw.githubusercontent.com/lavatee/facepalm/refs/heads/main/img/eachother.png"/>
                <input style={{marginTop: '3vh'}} placeholder="Почта" id="sign_up_email"/>
                <input style={{marginTop: '3vh'}} placeholder="Пароль" id="sign_up_password"/>
                <input style={{marginTop: '3vh'}} placeholder="Имя" id="sign_up_name"/>
                <input style={{marginTop: '3vh'}} placeholder="Айди" id="sign_up_tag"/>
                <button style={{marginTop: '3vh'}} onClick={() => {
                    try {
                        SignUp()
                        
                    } catch (err) {
                        console.error(err)
                    }
                    
                }}>Создать аккаунт</button>
                <button style={{marginTop: '3vh'}} onClick={() => {
                    setType("sign in")
                    document.getElementById("sign_up_email").value = ""
                    document.getElementById("sign_up_password").value = ""
                    document.getElementById("sign_up_name").value = ""
                    document.getElementById("sign_up_tag").value = ""
                }}>Войти</button>
            </div>
        )
    }
    async function SignUp() {
        const email = document.getElementById("sign_up_email").value
        const password = document.getElementById("sign_up_password").value
        const name = document.getElementById("sign_up_name").value
        const tag = document.getElementById("sign_up_tag").value
        if (email == "" || password == "" || name == "" || tag == "") {
            alert("Заполните все поля")
            return
        }
        try {
            const response = await fetch(`${backend}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email: email, password: password, name: name, tag: tag})
            })
            if (response.status == 200) {
                const data = await response.json()
                localStorage.setItem("user_id", data.id) 
                document.getElementById("sign_up_email").value = ""
                document.getElementById("sign_up_password").value = ""
                document.getElementById("sign_up_name").value = ""
                document.getElementById("sign_up_tag").value = ""
                setType("sign in")
                setMessage("Sign in to the account you created")
            }
            else {
                setMessage("Айди уже занято")
            }
            
        } catch (err) {
            setMessage("Айди уже занято")
        }
    }
}

async function SignIn(navigate) {
    const email = document.getElementById("sign_in_email").value
    const password = document.getElementById("sign_in_password").value
    try {
        const response = await fetch(`${backend}/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email: email, password: password})
        })
        if (response.status == 200) {
            const data = await response.json()
            console.log(data.access)
            console.log(data.refresh)
            localStorage.setItem("access_token", data.access)
            localStorage.setItem("refresh_token", data.refresh)
            localStorage.setItem("user_id", data.userId)
            navigate("/teams")
        }
        
    } catch (err) {
        console.error(err)
    }
}



export default Auth