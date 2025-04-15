import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"
import { useParams } from "react-router-dom"
import { backend, RequestToApi } from "./App";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import './App.css';

export function NewRequest() {
    const navigate = useNavigate()
    const params = useParams()
    console.log(params)
    const [team, setTeam] = useState(null)
    const [message, setMessage] = useState("")
    const [isSent, setIsSent] = useState(false)
    const [interviewId, setInterviewId] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        RequestToApi(GetTeam, SaveTeam)
        console.log(team)
    }, []
    )
    return(
        <div>
            <button onClick={() => navigate(`/team/${params.teamid}`)}><BsArrowLeftCircleFill style={{fontSize: 23}}/></button>
            <h1>Запрос в {team != null ? team.ProjectName : " ..."}</h1>
            <select id="userRole">
                <option value="" disabled selected>Ваша роль в команде</option>
                {   team != null ?
                    team.Roles.map(role => (
                        <>
                        {
                            role?.IsOpen ? <option value={role.Id}>{role.Name}{role?.IsOpen && role.MainTechnology != undefined ? " " + role.MainTechnology : ""}</option> : ""
                        }
                        </>
                    )) : ""
                }
            </select>
            <textarea placeholder="Напишите немного о своем опыте (максимум 200 символов)" id="cv"/>
            {
                message == "ok" ? "" :
                <button onClick={() => RequestToApi(SendRequest, SaveSendRequest)}>Отправить запрос</button>
            }
            {
                interviewId == 0 && !isLoading ?
                <button disabled={isSent ? false : true} onClick={isSent ? GenerateInterview : () => alert("Отправьте запрос")}>ИИ Собеседование</button>
                : (isLoading ? <div style={{flexDirection: "row", marginTop: "10px"}} className="loader"><img src="/img/loading.png" className="dot"/><img src="/img/loading.png" className="dot"/><img src="/img/loading.png" className="dot"/></div> : <button onClick={() => navigate(`/interview/${interviewId}`)}>Приступить к собеседованию</button>)
            }
            
            <p style={{background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", padding: "15px", borderRadius: "40px"}}>Отправьте запрос и пройдите собеседование от ИИ для увеличение шансов попадания в команду</p>
            
            <h2 style={{color: message == "ok" ? "green" : "red"}}>{message == "ok" ? "Запрос отправлен успешно" : message}</h2>
        </div>
    )
    async function GenerateInterview() {
        setIsLoading(true)
        const socket = new WebSocket(`ws://localhost:8000/ws/interviews/generate/${params.teamid}/user/${localStorage.getItem("access_token")}`);
        socket.onmessage = SaveInterview
        socket.onclose = ()  => {
            
            setIsLoading(false)
        }
    }
    function SaveInterview(event) {
        setIsLoading(false)
        const data = JSON.parse(event.data)
        setInterviewId(data)
        // } else {
        //     setMessage("Ошибка при составлении собеседования")
        // }
    }
    async function GetTeam() {
        
        const response = await fetch(`${backend}/api/teams/${params.teamid}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    async function SaveTeam(data, status) {
        if (status == 200) {
            setTeam(data.team)
        }
        else {
            setMessage(data.message)
        }
    }
    async function SendRequest() {
        const cv = document.getElementById("cv").value
        const roleId = document.getElementById("userRole").value
        console.log(roleId)
        const data = {
            cv: cv,
            roleId: Number(roleId),
            teamId: Number(params.teamid)
        }
        const response = await fetch(`${backend}/api/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(data)
        })
        return response
    }
    function SaveSendRequest(data, status) {
        if (status == 200) {
            setMessage("ok")
            setIsSent(true)
        }
        else {
            setMessage(data.message)
        }
    }
}

export function UserRequests() {
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [message, setMessage] = useState("")
    // const [currentRequest, setCurrentRequest] = useState(0)
    let currentRequest = 0
    useEffect(() => {
        RequestToApi(GetRequests, SaveRequests)
    }, [])
    return(
        <div>
            <button onClick={() => navigate("/teams")}><BsArrowLeftCircleFill style={{fontSize: 23}}/></button>
            <h1>Запросы в ваши команды:</h1>
            <h2>{message == "ok" ? "" : message}</h2>
            <ul>
                {
                    requests ? 
                    requests.reverse().map(request => (
                        <li key={request.Id}>
                            <h2>{request.UserName}</h2>
                            <h3>Команда: {request.ProjectName}</h3>
                            <h3>Роль: {request.RoleName} {request.MainTechnology}</h3>
                            <p>Сообщение: {request.CV}</p>
                            <div>
                                <button onClick={() => {
                                    currentRequest = request.Id
                                    console.log(currentRequest)
                                    RequestToApi(() => AcceptRequest(request.TeamId, request.RoleId, request.UserId, request.Id), SaveRequest)
                                }} style={{color: "green", fontWeight: 700}}>Принять</button>
                                <button onClick={() => {
                                    currentRequest = request.Id
                                    console.log(currentRequest)
                                    RequestToApi(() => RejectRequest(request.Id), SaveRequest)
                                }} style={{color: "red", fontWeight: 700}}>Отклонить</button>
                            </div>
                            
                        </li>
                    )) : ""
                }
            </ul>
        </div>
    )
    async function GetRequests() {
        const response = await fetch(`${backend}/api/requests`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveRequests(data, status) {
        if (status == 200) {
            setRequests(data.requests)
        }
        else {
            setMessage(data.message)
        }
    }
    async function AcceptRequest(teamId, roleId, userId, requestId) {
        const response = await fetch(`${backend}/api/teams/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({teamId: teamId, roleId: roleId, userId: userId})
        })
        
        return response
    }
    async function RejectRequest(requestId) {
        const response = await fetch(`${backend}/api/requests/${requestId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveRequest(data, status) {
        console.log(currentRequest)
        if (status == 200) {
            setRequests(requests.filter(req => req.Id != currentRequest))
            setMessage("ok")
        }
        else {
            setMessage("Пользователь уже есть в команде")
        }
        
        currentRequest = 0
    }
}