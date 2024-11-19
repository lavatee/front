import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"
import { useParams } from "react-router-dom"
import { backend, RequestToApi } from "./App";
import './App.css';

export function NewRequest() {
    const navigate = useNavigate()
    const params = useParams()
    console.log(params)
    const [team, setTeam] = useState(null)
    const [message, setMessage] = useState("")
    useEffect(() => {
        RequestToApi(GetTeam, SaveTeam)
        console.log(team)
    }, []
    )
    return(
        <div>
            <button onClick={() => navigate(`/team/${params.teamid}`)}>{"< Back"}</button>
            <h1>Request to {team != null ? team.ProjectName : " ..."}</h1>
            <input placeholder="Your role in team" type="text" list="teamRoles" id="userRole"/>
            <datalist id="teamRoles">
                {   team != null ?
                    team.Roles.map(role => (
                        <option>{role?.IsOpen ? `${role.Id}: ` + role.Name : ""}{role?.IsOpen && role.MainTechnology != undefined ? " " + role.MainTechnology : ""}</option>
                    )) : ""
                }
            </datalist>
            <textarea placeholder="Write shortly about your experience (at most 200 symbols)" id="cv"/>
            {
                message == "ok" ? "" :
                <button onClick={() => RequestToApi(SendRequest, SaveSendRequest)}>Send request</button>
            }
            
            <h2 style={{color: message == "ok" ? "green" : "red"}}>{message == "ok" ? "Request was sended successfuly" : message}</h2>
        </div>
    )
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
        const roleId = Number(document.getElementById("userRole").value.split(":")[0])
        const data = {
            cv: cv,
            roleId: roleId,
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
    const [currentRequest, setCurrentRequest] = useState(0)
    useEffect(() => {
        RequestToApi(GetRequests, SaveRequests)
    }, [])
    return(
        <div>
            <button onClick={() => navigate("/teams")}>{"< Back"}</button>
            <h1>Requests to your teams:</h1>
            <h2>{message == "ok" ? "" : message}</h2>
            <ul>
                {
                    requests ? 
                    requests.map(request => (
                        <li key={request.Id}>
                            <h2>{request.UserName}</h2>
                            <h3>Team: {request.ProjectName}</h3>
                            <h3>Role: {request.RoleName} {request.MainTechnology}</h3>
                            <p>Message: {request.CV}</p>
                            <button onClick={() => RequestToApi(() => AcceptRequest(request.TeamId, request.RoleId, request.UserId, request.Id), SaveRequest)} style={{color: "green", fontWeight: 700}}>Accept</button>
                            <button onClick={() => RequestToApi(() => RejectRequest(request.Id), SaveRequest)} style={{color: "red", fontWeight: 700}}>Reject</button>
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
        setCurrentRequest(requestId)
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
        setCurrentRequest(requestId)
        const response = await fetch(`${backend}/api/requests/${requestId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveRequest(data, status) {
        if (status == 200) {
            setRequests(requests.filter(req => req.Id != currentRequest))
            setMessage("ok")
        }
        else {
            setMessage(data.message)
        }
        setCurrentRequest(0)
    }
}