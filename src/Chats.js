import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { backend, Header, mainPage, RequestToApi, wsAddress } from "./App";
import { useParams } from 'react-router-dom';
import { BsArrowLeftCircleFill, BsFillSendFill, BsCheckCircleFill, BsFillClockFill } from "react-icons/bs";
import './App.css';

export function GetProductivityImg(productivity) {
    if (productivity <= 24) {
        return "/img/0-24.png"
    }
    if (productivity >= 25 && productivity <= 49) {
        return "/img/25-49.png"
    }
    if (productivity >= 50 && productivity <= 74) {
        return "/img/50-74.png"
    }
    if (productivity >= 75 && productivity <= 89) {
        return "/img/75-89.png"
    }
    if (productivity >= 90) {
        return "/img/90-100.png"
    }
}

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

export function ChatHeader(props) {
    const navigate = useNavigate()
    return(
        <div style={{position: 'fixed', top: '0vh', display: 'flex', justifyContent: 'space-around', backgroundColor: '#0D0D0D', paddingTop: '3vh', zIndex: 999, background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)"}}>
            <div style={{display: "flex", flexDirection: "row"}}>
                <BsArrowLeftCircleFill onClick={() => navigate("/chats")} style={{fontSize: 30, color: "white", marginLeft: "5vw", position: "absolute"}}/>
                <div>
                    <h1>{props.TeamProjectName}</h1>
                </div>
               
            </div>
            
            <div style={{display: "flex", justifyContent: "space-around", justifyItems: "stretch", flexDirection: "row", maxWidth: "550px", width: "80vw", marginTop: '-2vh'}}>
                <h3 className={props.Page == "chat" ? "chosenPage" : ""} onClick={() => navigate(`/chat/${props.ChatId}`)}>Чат</h3>
                <h3 className={props.Page == "members" ? "chosenPage" : ""} onClick={() => navigate(`/chat/${props.ChatId}/members`)}>Участники</h3>
                <h3 className={props.Page == "tasks" ? "chosenPage" : ""} onClick={() => navigate(`/chat/${props.ChatId}/tasks`)}>Мои задачи</h3>
            </div>
        </div>
    )
}


export function OneChat() {
    const params = useParams()
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${params.id}/user/${localStorage.getItem("user_id")}`);

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
            {messages.length != 0 && messages ? <ChatHeader Page="chat" ChatId={params.id} TeamProjectName={messages[0].TeamProjectName}/> : ""}
            
            <h3>{message == "ok" ? "" : message}</h3>
            <div>
                <ul style={{marginTop: '20vh', marginBottom: '15vh'}}>
                    {
                        messages.map(message => (
                            <li key={message.Id} onClick={message.UserId == Number(localStorage.getItem("user_id")) ? () => setMessageTo(message.Id) : () => {}} id={`${message.Id}`} className={message.UserId == Number(localStorage.getItem("user_id")) ? "userMessage" : "chatMessage"}>
                                <h4 style={{color: "#D99FFF"}}>{message.UserId == Number(localStorage.getItem("user_id")) ? "" : message.UserName}</h4>
                                <p style={{textAlign: "start"}}>{message.Text}</p>
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
                <div style={{position: 'fixed', bottom: '0vh', display: 'flex', flexDirection: "row", justifyContent: 'center', backgroundColor: '#0D0D0D', width: '100vw', paddingLeft: "5vw", paddingRight: "5vw", paddingBottom: '4vh', background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", paddingTop: 10}}>
                    <input id="userMessage" placeholder="Сообщение" style={{width: "70vw", maxWidth: "300px", padding: "17px", marginTop: "8px"}}/>
                    <button style={{width: "20vw", maxWidth: "80px", paddingBottom: "9px"}} onClick={() => {socket.send(JSON.stringify({Text: document.getElementById("userMessage").value, UserId: Number(localStorage.getItem("user_id"))})); document.getElementById("userMessage").value = ""}}><BsFillSendFill style={{fontSize: "20px", color: "white"}}/></button>
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

export function ChatMembers() {
    const params = useParams()
    const [message, setMessage] = useState("")
    const [chat, setChat] = useState(null)
    const [users, setUsers] = useState([])
    const [isNewTask, setIsNewTask] = useState(false)
    const [isLeave, setIsLeave] = useState(false)
    const [currentUserName, setCurrentUserName] = useState("")
    const [currentUserId, setCurrentUserId] = useState(0)
    const [currentUserRole, setCurrentUserRole] = useState("")
    const [date, setDate] = useState(new Date());
    const navigate = useNavigate()
    useEffect(() => {
        RequestToApi(GetChat, SaveChat)
        
    }, [])
    useEffect(() => {
        for (let i = 0; i < users.length; i++) {
            async function GetUserProductivity() {
                const response = await fetch(`${backend}/api/productivity/${users[i]?.UserId}/${chat?.TeamId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    }
                })
                return response
            }
            function SaveUserProductivity(data, status) {
                if (status == 200) {
                    users[i].Productivity = data.productivity
                    setUsers(users)
                    console.log()

                } else {
                    users[i].Productivity = 0
                }
            }
            RequestToApi(GetUserProductivity, SaveUserProductivity)
        }
    }, [chat])
    return(
        <div>
            {chat ? <ChatHeader Page="members" ChatId={params.id} TeamProjectName={chat.TeamProjectName}/> : ""}
            <h2 style={{marginTop: "25vh", zIndex: "500"}}>{message}</h2>
            
            <ul style={{marginTop: "0vh"}}>
                {users.map(user => (
                    <li>
                        <h2>{user?.UserName}</h2>
                        <h3>Роль: {user?.RoleName} {user?.RoleMainTechnology ? user?.RoleMainTechnology : ""}</h3>
                        <div style={{display: "flex", justifyContent: "space-around", flexDirection: "row", width: "100%"}}>
                            <h3>Продуктивность: {user?.Productivity >= 0 ? user?.Productivity : 0}%</h3>
                            <img src={`${GetProductivityImg(user?.Productivity)}`} style={{width: "80px"}}/>
                        </div>
                       
                        {user.UserId != Number(localStorage.getItem("user_id")) ? <button onClick={() => {setIsNewTask(true); setCurrentUserName(user.UserName); setCurrentUserId(user.UserId); setCurrentUserRole(user.RoleName + " " + (user?.RoleMainTechnology ? user.RoleMainTechnology : ""))}}>Дать задачу</button> : <button style={{backgroundColor: "#AF5050"}} onClick={() => setIsLeave(true)}>Выйти</button>}
                    </li>
                ))}
            </ul>
            {
                isNewTask ? <NewTask/> : ""
            }
            {
                isLeave ? <LeaveState/> : ""
            }
        </div>
    )
    
    async function GetChat() {
        const response = await fetch(`${backend}/api/chats/${params.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            }
        })
        return response
    }
    async function SaveChat(data, status) {
        if (status == 200) {
            setChat(data.chat)
            setUsers(data.users)
        } else {
            setMessage("Чат не найден")
        }
    }
    function NewTask() {
    
        return (
            <div style={{height: "100%", width: "101%", position: "fixed", background: "rgba(0, 0, 0, 0.4)", zIndex: "999"}}>
                <div style={{width: "75vw", maxWidth: "500px", background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", padding: "25px 10px 25px 10px", marginTop: "10vh", borderRadius: "40px"}}>
                    <h2>Задача для {currentUserName}</h2>
                    <h3>Роль: {currentUserRole}</h3>
                    <textarea placeholder="Опишите задачу" id="taskText" style={{width: "70vw", maxWidth: "400px", height: "150px"}}/>
                    <h3>Установите дедлайн задачи</h3>
                    <input
                        type="datetime-local"
                        placeholder="Дедлайн задачи"
                        id="deadline"
                    />
                    <button onClick={() => RequestToApi(PostTask, SaveTask)}>Дать задачу</button>
                    <button onClick={() => setIsNewTask(false)}>Отмена</button>
                    <h3>{message}</h3>
                </div>
            </div>
        );
    }
    async function PostTask() {
        const date = new Date(document.getElementById("deadline").value)
        const response = await fetch(`${backend}/api/tasks`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({text: document.getElementById("taskText").value, userId: currentUserId, teamId: chat.TeamId, deadline: date.toISOString().replace("T", " ").split(".")[0]})
        })
        return response
    }
    function SaveTask(data, status) {
        if (status == 200 && data.id != 0) {
            document.getElementById("taskText").value = ""
            document.getElementById("deadline").value = ""
            setIsNewTask(false)
            setMessage("Задача успешно создана")
        } else {
            setMessage("У пользователя должен быть хотя бы час на выполнение задачи")
        }
    }
    function LeaveState() {
        
        return(
            <div style={{height: "100%", width: "101%", position: "fixed", background: "rgba(0, 0, 0, 0.4)", zIndex: "999"}}>
                <div style={{width: "75vw", maxWidth: "500px", background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", padding: "25px 10px 25px 10px", marginTop: "10vh", borderRadius: "40px"}}>
                    <h3>Вы уверены, что хотите выйти из команды?</h3>
                    <button style={{backgroundColor: "#AF5050"}} onClick={() => RequestToApi(LeaveTeam, SaveTeamLeaving)}>ВЫЙТИ</button>
                    <button onClick={() => setIsLeave(false)}>Отмена</button>
                    <h3>{message}</h3>
                </div>
            </div>
        )
    }
    async function LeaveTeam() {
        const response = await fetch(`${backend}/api/teams/leave`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({userId: Number(localStorage.getItem("user_id")), teamId: chat.TeamId})
        })
        return response
    }
    function SaveTeamLeaving(data, status) {
        if (status == 200) {
            navigate("/chats")
        } else {
            setMessage("Не удалось выйти из команды")
        }
    }
}

export function ChatTasks() {
    const params = useParams()
    const [message, setMessage] = useState("")
    const [chat, setChat] = useState(null)
    const [tasks, setTasks] = useState([])
    const [currentTask, setCurrentTask] = useState(null)
    useEffect(() => {
        RequestToApi(GetChat, SaveChat)
    }, [])
    useEffect(() => {
        RequestToApi(GetTasks, SaveTasks)
    }, [chat])
    return(
        <div>
            {chat ? <ChatHeader Page="tasks" ChatId={params.id} TeamProjectName={chat.TeamProjectName}/> : ""}
            <h2 style={{marginTop: "25vh", zIndex: "500"}}>{message}</h2>
            <ul>
                <h3>{tasks[0] ? tasks[0].CreatedAt.split(" ")[0] : ""}</h3>
                {   tasks ?
                    tasks.map((task, i) => (
                        <>
                        <li>
                            <h2>От {task?.CreatorUserName}</h2>
                            <h3>Задача: {task?.Text}</h3>
                            <h3 style={{fontWeight: "500"}}>Дедлайн: {task?.Deadline}</h3>
                            {task.Status == "pending" ? <button onClick={() => {task.Index = i; setCurrentTask(task); RequestToApi(markTaskAsCompleted, saveTaskCompleting)}}><BsCheckCircleFill style={{fontSize: 25, color: "white"}}/></button> : <h3 style={{backgroundColor: "#685A72", padding: "15px", borderRadius: "20px"}}><BsFillClockFill style={{fontSize: 20, color: "white"}}/> Ожидание подтверждения</h3>}
                            <p style={{marginLeft: "80%", marginTop: "-5%"}}>{task.CreatedAt.split(" ")[1]}</p>
                        </li>
                        <h3>{task?.CreatedAt.split(" ")[0] == tasks[i + 1]?.CreatedAt.split(" ")[0] ? "" : tasks[i + 1]?.CreatedAt.split(" ")[0]}</h3>
                        </>
                    ))
                    : <h2>У вас нет задач</h2>
                }
            </ul>
        </div>
    )
    async function GetChat() {
        const response = await fetch(`${backend}/api/chats/${params.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            }
        })
        return response
    }
    function SaveChat(data, status) {
        if (status == 200) {
            setChat(data.chat)
        } else {
            setMessage("Чат не найден")
        }
    }
    async function GetTasks() {
        const currentDate = new Date();
        const timezoneOffset = currentDate.getTimezoneOffset();
        const timezoneOffsetHours = -timezoneOffset / 60;
        const timezoneString = timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours}` : `${timezoneOffsetHours}`;
        console.log(timezoneString);
        const response = await fetch(`${backend}/api/current_tasks/team/${chat.TeamId}/${timezoneString}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            }
        })
        return response
    }
    function SaveTasks(data, status) {
        if (status == "200") {
            setTasks(data.tasks.reverse())
        } else {
            setMessage("Ошибка при получении задач")
        }
    }
    async function markTaskAsCompleted() {
        console.log(currentTask)
        const response = await fetch(`${backend}/api/tasks/mark_as_completed/${currentTask.Id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({})
        })
        return response
    }
    function saveTaskCompleting(data, status) {
        if (status == 200) {
            tasks[currentTask.Index].Status = "marked_as_completed"
            setMessage(`Выполнение задачи ожидает подтверждение от ${currentTask.CreatorUserName}`)
        }
    }
}
