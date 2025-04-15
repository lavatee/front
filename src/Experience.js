import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { backend, Header, RequestToApi } from "./App";
import { useParams } from 'react-router-dom';
import './App.css';
import { BsArrowLeftCircleFill, BsFillSendFill, BsCheckCircleFill, BsFillClockFill } from "react-icons/bs";
import { GetProductivityImg } from "./Chats";

export function UserExperience() {
    const [exps, setExps] = useState([])
    const [message, setMessage] = useState("")
    useEffect(() => {
        RequestToApi(GetExps, SaveExps)
    }, [])
    return(
        <div>
            <Header page="experience"/>
            <h3 style={{marginTop: "10vh"}}>{message}</h3>
            <h1 style={{marginTop: "5vh"}}>Eachother Experience</h1>
            <ul>
                {
                    exps ?
                    exps.map(exp => (
                        <li>
                            <h2>{exp?.TeamProjectName}</h2>
                            <h3>Роль: {exp?.Role + " " + (exp?.MainTechnology ? exp.MainTechnology : "")}</h3>
                            <h3>Выполненные задачи: {exp?.CompletedTasksAmount ? exp?.CompletedTasksAmount : 0}</h3>
                            <h3>Проваленные задачи: {exp?.FailedTasks ? exp?.FailedTasks : 0}</h3>
                            <div style={{display: "flex", justifyContent: "space-around", flexDirection: "row", width: "100%"}}>
                                <h3>Продуктивность: {exp?.Productivity >= 0 ? exp?.Productivity : 0}%</h3>
                                <img src={`${GetProductivityImg(exp?.Productivity)}`} style={{width: "80px"}}/>
                            </div>
                        </li>
                    )) : <h2>Вступайте в команды и получайте опыт</h2>
                }
            </ul>
            
        </div>
    )
    async function GetExps() {
        const response = await fetch(`${backend}/api/experience`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            }
        })
        return response
    }
    function SaveExps(data, status) {
        if (status == 200) {
            setExps(data.exps)
        } else {
            setMessage("Ошибка при получении опыта")
        }
    }
}