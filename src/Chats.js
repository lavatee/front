import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { backend, Header, RequestToApi, wsAddress } from "./App";
import { useParams } from 'react-router-dom';
import './App.css';

export function UserChats() {
    const navigate = useNavigate()
    const [chats, setChats] = useState([])
    const [message, setMessage] = useState("")
    useEffect(() => {
        RequestToApi(GetChats, SaveChats)
    }, [])
    return(
        <div>
            <Header page="chats"/>
            <h1 style={{marginTop: "15vh"}}>Ваши чаты:</h1>
            <ul>
                {
                    chats.map(chat => (
                        <li key={chat.ChatId} onClick={() => navigate(`/chat/${chat.ChatId}`)}>
                            <h3>{chat.TeamProjectName}</h3>
                            <p>{chat.UserName}: {chat.Text}</p>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
    async function GetChats() {
        const response = await fetch(`${backend}/api/chats`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveChats(data, status) {
        if (status == 200) {
            if (data.messages == null) {
                return
            } 
            setChats(data.messages)
            setMessage("ok")
        }
        else {
            setMessage("Возникли проблемы с получением чатов")
        }
    }
}


export function OneChat() {
    const params = useParams()
    const socket = new WebSocket(`ws://62.60.239.229/api/ws/ws/chat/${params.id}/user/${localStorage.getItem("user_id")}`);

    socket.onopen = function(event) {
        console.log('Connected to the WebSocket server');
    };

    socket.onmessage = function(event) {
        setMessages([...messages, JSON.parse(event.data)])
    };

    socket.onclose = function(event) {
        console.log('Connection closed');
    };;

    const navigate = useNavigate()
    
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState("")
    const [messageTo, setMessageTo] = useState(0)
    const [messageToEdit, setMessageToEdit] = useState(0)
    const [textToEdit, setTextToEdit] = useState("")
    
    // const [deleteMessageResponse, setDeleteMessageResponse] = useState("")
    // const [editMessageResponse, setEditMessageResponse] = useState("")
    useEffect(() => {
        RequestToApi(GetMessages, SaveMessages)
        
    }, [])
    useEffect(() => {
        if (document.getElementById(`${messages[messages?.length - 1]?.Id}`)) {
            const target = document.getElementById(`${messages[messages?.length - 1].Id}`)
            target.scrollIntoView({ behavior: 'smooth' });
            console.log("eshkere")
        }
    }, [messages])
    return(
        <div>
            <div style={{position: 'fixed', top: '0vh', display: 'flex', justifyContent: 'space-around', backgroundColor: '#0D0D0D', paddingTop: '3vh', zIndex: 999, background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)"}}>
                <button onClick={() => navigate("/chats")}>{"< Назад"}</button>
                <h1>{messages.length != 0 && messages ? messages[0].TeamProjectName : ""}</h1>
            </div>
            
            <h3>{message == "ok" ? "" : message}</h3>
            <div>
                <ul style={{marginTop: '15vh', marginBottom: '15vh'}}>
                    {
                        messages.map(message => (
                            <li key={message.Id} onClick={message.UserId == Number(localStorage.getItem("user_id")) ? () => setMessageTo(message.Id) : () => {}} id={`${message.Id}`}>
                                <h4>{message.UserName}</h4>
                                <p>{message.Text}</p>
                                {
                                    messageTo == message.Id && message.UserId == Number(localStorage.getItem("user_id")) ?
                                    <div>
                                        <button onClick={() => RequestToApi(DeleteMessage, SaveDeleteMessage)}>Удалить</button>
                                        <button onClick={() => {setMessageToEdit(message.Id); setTextToEdit(message.Text)}}>Изменить</button>
                                        {
                                            messageToEdit == message.Id ?
                                            <div>
                                                <input id={`${message.Id}input`} value={textToEdit} onChange={(event) => setTextToEdit(event.target.value)} />
                                                <button onClick={() => {RequestToApi(EditMessage, SaveEditMessage)}}>Сохранить</button>
                                            </div>
                                             : ""
                                        }
                                    </div>
                                    : ""
                                    
                                }
                            </li>
                        ))
                    }
                </ul>
                <div style={{position: 'fixed', bottom: '0vh', display: 'flex', justifyContent: 'space-around', backgroundColor: '#0D0D0D', width: '100vw', paddingBottom: '4vh', background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", paddingTop: 10}}>
                    <input id="userMessage" placeholder="Сообщение"/>
                    <button onClick={() => {socket.send(JSON.stringify({Text: document.getElementById("userMessage").value, UserId: Number(localStorage.getItem("user_id"))})); document.getElementById("userMessage").value = ""}}>Отправить</button>
                </div>
            </div>
        </div>
    )
    async function GetMessages() {
        const response = await fetch(`${backend}/api/messages/${params.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveMessages(data, status) {
        console.log(messages)
        if (status == 200) {
            
            setMessages(data.messages)
            
            setMessage("ok")
        }
        else {
            setMessage("Ошибка при получении сообщений чата")
        }
    }
    async function DeleteMessage() {
        const response = await fetch(`${backend}/api/messages/${messageTo}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveDeleteMessage(data, status) {
        console.log("didlodoioafajigoadfgoh")
        if (status == 200) {
            setMessage("ok")
            setMessages(messages.filter(message => message.Id != messageTo))
            console.log('hello')
            setMessageTo(0)
        }
        else {
            setMessage("Ошибка при удалении сообщения")
        }
    }
    async function EditMessage() {
        const response = await fetch(`${backend}/api/messages/${messageToEdit}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({text: document.getElementById(`${messageToEdit}input`).value})
        })
        return response
    }
    function SaveEditMessage(data, status) {
        if (status == 200) {
            setMessage("ok")
            const ms = messages
            ms[messages.findIndex(message => message.Id == messageToEdit)].Text = textToEdit
            setMessages(ms)
            setMessageTo(0)
            setMessageToEdit(0)
            setTextToEdit("")
        }
        else {
            setMessage("Ошибка при изменении сообщения")
        }
    }
}