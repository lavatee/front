import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { backend, Header, RequestToApi } from "./App";
import './App.css';

export function UserProfile() {
    const navigate = useNavigate()
    const params = useParams()
    const [user, setUser] = useState(null)
    const [message, setMessage] = useState("")
    useEffect(() => {
        RequestToApi(GetUser, SaveUser)
    }, [])
    return(
        <div>
            <Header page={"profile"}/>
            <h3>{message == "ok" ? "" : message}</h3>
            
            {
                user ?
                <div>
                    <h2>Личные данные:</h2>
                    <div>
                        <h3>Имя: {user.name}</h3>
                        <h3>Айди: @{user.tag}</h3>
                        {
                            user.userId == Number(localStorage.getItem("user_id")) ?
                            <div>
                                <h3>Почта: {user.email}</h3>
                                <button>Изменить</button>
                            </div>
                             : ""
                        }
                    </div>
                    <h2>Технологический стек:</h2>
                    <div>
                        <h3>Роль: {user.role}</h3>
                        <h3>Стек: {user.mainTechnology}</h3>
                        {
                            user.userId == Number(localStorage.getItem("user_id")) ?
                            <button>Изменить</button>
                             : ""
                        }
                    </div>
                    {
                            user.userId == Number(localStorage.getItem("user_id")) ?
                            <button onClick={() => {
                                localStorage.setItem("access_token", null)
                                localStorage.setItem("refresh_token", null)
                                navigate("/")
                            }} style={{marginTop: '10vh', backgroundColor: 'red'}}>Выйти из аккаунта</button>
                             : ""
                    }
                </div>
                
                : ""
            }
        </div>
    )
    async function GetUser() {
        const response = await fetch(`${backend}/api/teams/users/${params.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveUser(data, status) {
        if (status == 200) {
            setUser(data)
            setMessage("ok")
        }
        else {
            setMessage("Проблемы с подключением")
        }
    }
    
}