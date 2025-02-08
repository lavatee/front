import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { backend, Header, RequestToApi, roles } from "./App";
import './App.css';

export function UserProfile() {
    const navigate = useNavigate()
    const params = useParams()
    const [user, setUser] = useState(null)
    const [message, setMessage] = useState("")
    const [editingInfo, setEditingInfo] = useState(false)
    const [editingStack, setEditingStack] = useState(false)
    const [newName, setNewName] = useState("")
    const [newTag, setNewTag] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newRole, setNewRole] = useState("")
    const [newMainTechnology, setNewMainTechnology] = useState("")
    const roleNames = []
    for (let roleName in roles) {
        roleNames.push(roleName)
    }
    useEffect(() => {
        RequestToApi(GetUser, SaveUser)
    }, [])
    useEffect(() => {
        if (editingInfo) {
            document.getElementById("newName").value = user.name
            document.getElementById("newTag").value = user.tag
            document.getElementById("newEmail").value = user.email
        }
    }, editingInfo)
    useEffect(() => {
        if (editingStack) {
            document.getElementById("newRole").value = user.role
            document.getElementById("newMainTechnology").value = user.mainTechnology
        }
        
    }, editingStack)
    return(
        <div>
            <Header page={"profile"}/>
            <h3 style={{marginTop: "15vh"}}>{message == "ok" ? "" : message}</h3>
            
            {
                user ?
                <div>
                    <h2>Личные данные:</h2>
                    <div className="profile">
                        <h3>Имя: {!editingInfo ? user.name : <input value={newName} onChange={(e) => setNewName(e.target.value)} id="newName"/>}</h3>
                        <h3>Айди: {!editingInfo ? "@" + user.tag : <input value={newTag} onChange={(e) => setNewTag(e.target.value)} id="newTag"/>}</h3>
                        {
                            user.userId == Number(localStorage.getItem("user_id")) ?
                            <div>
                                <h3>Почта: {!editingInfo ? user.email : <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} id="newEmail"/>}</h3>
                                {
                                    !editingInfo ?
                                    <button onClick={() => {
                                        setEditingInfo(true)
                                        setNewName(user.name)
                                        setNewTag(user.tag)
                                        setNewEmail(user.email)
                                    }}>Изменить</button>
                                    :
                                    <div>
                                        <button onClick={() => RequestToApi(EditInfo, SaveInfo)}>Сохранить</button>
                                        <button onClick={() => setEditingInfo(false)}>Отменить</button>
                                    </div>
                                }
                            </div>
                             : ""
                        }
                    </div>
                    <h2>Технологический стек:</h2>
                    <div className="profile">
                        <h3>Роль: {!editingStack ? user.role :
                            <select id="newRole" value={newRole} onChange={() => setNewRole(document.getElementById("newRole").value)}>
                                <option value={""}>Нет</option>
                                {
                                    roleNames.map(roleName => (
                                        <option value={roleName}>{roleName}</option>
                                    ))
                                }
                            </select>
                            }
                        </h3>
                        <h3>Стек: {!editingStack ? user.mainTechnology :
                            
                            <select id="newMainTechnology" value={newMainTechnology} onChange={() => setNewMainTechnology(document.getElementById("newMainTechnology").value)}>
                                <option value={""}>Нет</option>
                                {
                                    roles[newRole]?.length > 0 ?
                                    roles[newRole].map(technology => (
                                        <option value={technology}>{technology}</option>
                                    ))
                                    : ""
                                }
                            </select>
                        }</h3>
                        {
                            user.userId == Number(localStorage.getItem("user_id")) ?
                            <div>
                                {
                                    !editingStack ?
                                    <button onClick={() => {
                                        setEditingStack(true)
                                        setNewRole(user.role)
                                        setNewMainTechnology(user.mainTechnology)
                                    }}>Изменить</button>
                                    :
                                    <div>
                                        <button onClick={() => RequestToApi(EditStack, SaveStack)}>Сохранить</button>
                                        <button onClick={() => setEditingStack(false)}>Отменить</button>
                                    </div>
                                }
                            </div>
                            
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
    async function EditInfo() {
        const response = await fetch(`${backend}/api/users/data`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({name: newName, tag: newTag, email: newEmail})
        })
        return response
    }
    function SaveInfo(data, status) {
        if (status == 200) {
            const newUserInfo = user
            newUserInfo.name = newName
            newUserInfo.tag = newTag
            newUserInfo.email = newEmail
            setUser(newUserInfo)
        } else {
            setMessage("Айди занят")
        }
        setEditingInfo(false)
    }
    async function EditStack() {
        console.log(document.getElementById("newMainTechnology").value, "==", newMainTechnology)
        const response = await fetch(`${backend}/api/users/stack`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({role: newRole, mainTechnology: document.getElementById("newMainTechnology").value})
        })
        return response
    }
    function SaveStack(data, status) {
        if (status == 200) {
            const newUserInfo = user
            newUserInfo.role = newRole
            newUserInfo.mainTechnology = document.getElementById("newMainTechnology").value
            setUser(newUserInfo)
        } else {
            setMessage("Некорректно введен стек")
        }
        setEditingStack(false)
    }
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