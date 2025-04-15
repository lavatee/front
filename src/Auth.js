import React, { useState } from "react";
import { useNavigate } from "react-router";
import { backend } from "./App";
import {  useParams } from 'react-router-dom'
import './App.css';
import { BsArrowLeftCircleFill } from "react-icons/bs";

export function Auth() {
    const [type, setType] = useState("sign in")
    const [message, setMessage] = useState("")
    const navigate = useNavigate()
    const params = useParams()
    if (params?.link) {
        localStorage.setItem("action", "ref")
        localStorage.setItem("refLink", params.link)
    }
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
                <input style={{marginTop: '3vh'}} type="email" placeholder="Почта" id="sign_in_email"/>
                <input style={{marginTop: '3vh'}} type="password" placeholder="Пароль" id="sign_in_password"/>
                <button style={{marginTop: '3vh'}} onClick={() => SignIn(navigate)}>Войти</button>
                <button style={{marginTop: '3vh'}} onClick={handleSignInWithoutPassword}>
                    Войти без пароля
                </button>
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
                <input style={{marginTop: '3vh'}} type="email" placeholder="Почта" id="sign_up_email"/>
                <input style={{marginTop: '3vh'}} type="password" placeholder="Пароль" id="sign_up_password"/>
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
        if (email.split("@").length != 2 || email.split("@")[1].split(".").length != 2) {
            alert("Введите корректную почту")
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
                setMessage("Войдите в созданный аккаунт")
            }
            else {
                setMessage("Айди уже занято")
            }
            
        } catch (err) {
            setMessage("Айди уже занято")
        }
    }
    async function handleSignInWithoutPassword() {
        const email = document.getElementById("sign_in_email").value;
        if (!email) {
            setMessage("Введите почту");
            return;
        }
        try {
            const response = await fetch(`${backend}/auth/send_code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            });
            if (response.ok) {
                localStorage.setItem("email_for_code", email);
                navigate("/by_code");
            } else {
                const data = await response.json();
                setMessage(data.message || "Ошибка отправки кода");
            }
        } catch (error) {
            setMessage("Ошибка соединения");
            console.error(error);
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
            } else {
                setMessage("Неправильный логин или пароль")
            }
            
        } catch (err) {
            console.error(err)
            
        }
    }
}
export function ByCode() {
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    async function handleVerifyCode() {
        const email = localStorage.getItem("email_for_code");
        if (!email) {
            setMessage("Сессия истекла");
            return;
        }
        try {
            const response = await fetch(`${backend}/auth/signin/without_password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, code: code })
            });
            
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);
                localStorage.setItem("user_id", data.userId);
                navigate("/teams");
            } else {
                const data = await response.json();
                setMessage(data.message || "Неверный код");
            }
        } catch (err) {
            setMessage("Ошибка соединения");
            console.error(err);
        }
    }

    return (
        <div>
            <button style={{marginTop: "15vh"}} onClick={() => navigate("/")}><BsArrowLeftCircleFill style={{fontSize: 23}}/></button>
            <h2>Введите код из почты</h2>
            <input 
                placeholder="Код"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={handleVerifyCode}>Подтвердить</button>
            <p>{message}</p>
        </div>
    );
}



