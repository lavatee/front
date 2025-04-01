import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { backend, Header, mainPage, RequestToApi } from "./App";
import { useParams } from 'react-router-dom';
import './App.css';
import { BsArrowLeftCircleFill, BsFillSendFill, BsCheckCircleFill, BsFillClockFill } from "react-icons/bs";

function TasksHeader(props) {
    const navigate = useNavigate()
    return(
        <div>
            <h1 style={{marginTop: "18vh"}}>Задачи</h1>
            <div style={{display: "flex", justifyContent: "space-around", flexDirection: "row", maxWidth: "550px", width: "76vw", left: "12vw"}}>
                <button onClick={() => navigate("/mytasks/current")} style={{fontWeight: props.page == "current" ? 800 : 500, backgroundColor: props.page == "current" ? "#685A72" : "#B57BDC"}}>Активные</button>
                <button onClick={() => navigate("/mytasks/created")} style={{fontWeight: props.page == "created" ? 800 : 500, backgroundColor: props.page == "created" ? "#685A72" : "#B57BDC"}}>Созданные мной</button>
            </div>
            <div style={{display: "flex", justifyContent: "space-around", flexDirection: "row", maxWidth: "550px", width: "76vw", left: "12vw"}}>
                <button onClick={() => navigate("/mytasks/completed")} style={{fontWeight: props.page == "completed" ? 800 : 500, backgroundColor: props.page == "completed" ? "#685A72" : "#B57BDC"}}>Выполненные</button>
                <button onClick={() => navigate("/mytasks/failed")} style={{fontWeight: props.page == "failed" ? 800 : 500, backgroundColor: props.page == "failed" ? "#685A72" : "#B57BDC"}}>Проваленные</button>
            </div>
        </div>
    )
}

export function UserCurrentTasks() {
    const [tasks, setTasks] = useState([])
    const [message, setMessage] = useState("")
    const [currentTask, setCurrentTask] = useState(null)
    useEffect(() => {
        RequestToApi(GetUserCurrentTasks, SaveTasks)
    }, [])
    return(
        <div>
            <Header page="tasks"/>
            <TasksHeader page="current"/>
            <h3>{message}</h3>
            <ul>
                <h3>{tasks?.[0] ? tasks[0].CreatedAt.split(" ")[0] : ""}</h3>
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
    async function GetUserCurrentTasks() {
        const currentDate = new Date();
        const timezoneOffset = currentDate.getTimezoneOffset();
        const timezoneOffsetHours = -timezoneOffset / 60;
        const timezoneString = timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours}` : `${timezoneOffsetHours}`;
        console.log(timezoneString);
        const response = await fetch(`${backend}/api/current_tasks/${timezoneString}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveTasks(data, status) {
        if (status == 200) {
            setTasks(data.tasks)
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

export function TasksUserCreated() {
    const statusMap = {
        "pending": {text: "В процессе", color: "#685A72"},
        "completed": {text: "Выполнено!", color: "#5B9265"},
        "failed": {text: "Провалено", color: "#AF5050"}
    }
    const [tasks, setTasks] = useState([])
    const [message, setMessage] = useState("")
    const [currentTask, setCurrentTask] = useState(null)
    useEffect(() => {
        RequestToApi(GetUserCurrentTasks, SaveTasks)
    }, [])
    return(
        <div>
            <Header page="tasks"/>
            <TasksHeader page="created"/>
            <h3>{message}</h3>
            <ul>
                <h3>{tasks?.[0] ? tasks[0].CreatedAt.split(" ")[0] : ""}</h3>
                {   tasks ?
                    tasks.map((task, i) => (
                        <>
                        <li>
                            <h2>Для {task?.UserUserName}</h2>
                            <h3>Задача: {task?.Text}</h3>
                            <h3 style={{fontWeight: "500"}}>Дедлайн: {task?.Deadline}</h3>
                            {task.Status == "marked_as_completed" ? <button onClick={() => {task.Index = i; setCurrentTask(task); RequestToApi(CompleteTask, saveTaskCompleting)}}><BsCheckCircleFill style={{fontSize: 15, color: "white"}}/> Подтвердить выполнение</button> : <h3 style={{backgroundColor: statusMap[task.Status].color, padding: "15px", borderRadius: "20px"}}>{statusMap[task.Status].text}</h3>}
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
    async function GetUserCurrentTasks() {
        const currentDate = new Date();
        const timezoneOffset = currentDate.getTimezoneOffset();
        const timezoneOffsetHours = -timezoneOffset / 60;
        const timezoneString = timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours}` : `${timezoneOffsetHours}`;
        console.log(timezoneString);
        const response = await fetch(`${backend}/api/created_tasks/${timezoneString}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveTasks(data, status) {
        if (status == 200) {
            setTasks(data.tasks)
        } else {
            setMessage("Ошибка при получении задач")
        }
    }
    async function CompleteTask() {
        console.log(currentTask)
        const response = await fetch(`${backend}/api/tasks/complete/${currentTask.Id}`, {
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
            tasks[currentTask.Index].Status = "completed"
            setMessage(`Выполнение задания подтверждено!`)
        }
    }
}

export function UserFailedTasks() {
    const [tasks, setTasks] = useState([])
    const [message, setMessage] = useState("")
    useEffect(() => {
        RequestToApi(GetUserCurrentTasks, SaveTasks)
    }, [])
    return(
        <div>
            <Header page="tasks"/>
            <TasksHeader page="failed"/>
            <h3>{message}</h3>
            <ul>
                <h3>{tasks?.[0] ? tasks[0].CreatedAt.split(" ")[0] : ""}</h3>
                {   tasks ?
                    tasks.map((task, i) => (
                        <>
                        <li style={{background: "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 10%, rgba(191, 24, 24, 0.4) 120%)"}}>
                            <h2>От {task?.CreatorUserName}</h2>
                            <h3>Задача: {task?.Text}</h3>
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
    async function GetUserCurrentTasks() {
        const currentDate = new Date();
        const timezoneOffset = currentDate.getTimezoneOffset();
        const timezoneOffsetHours = -timezoneOffset / 60;
        const timezoneString = timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours}` : `${timezoneOffsetHours}`;
        console.log(timezoneString);
        const response = await fetch(`${backend}/api/failed_tasks/${timezoneString}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveTasks(data, status) {
        if (status == 200) {
            setTasks(data.tasks)
        } else {
            setMessage("Ошибка при получении задач")
        }
    }
}

export function UserCompletedTasks() {
    const [tasks, setTasks] = useState([])
    const [message, setMessage] = useState("")
    useEffect(() => {
        RequestToApi(GetUserCurrentTasks, SaveTasks)
    }, [])
    return(
        <div>
            <Header page="tasks"/>
            <TasksHeader page="completed"/>
            <h3>{message}</h3>
            <ul>
                <h3>{tasks?.[0] ? tasks[0].CreatedAt.split(" ")[0] : ""}</h3>
                {   tasks ?
                    tasks.map((task, i) => (
                        <>
                        <li style={{background: "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 10%, rgba(0, 173, 20, 0.4) 120%)"}}>
                            <h2>От {task?.CreatorUserName}</h2>
                            <h3>Задача: {task?.Text}</h3>
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
    async function GetUserCurrentTasks() {
        const currentDate = new Date();
        const timezoneOffset = currentDate.getTimezoneOffset();
        const timezoneOffsetHours = -timezoneOffset / 60;
        const timezoneString = timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours}` : `${timezoneOffsetHours}`;
        console.log(timezoneString);
        const response = await fetch(`${backend}/api/completed_tasks/${timezoneString}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveTasks(data, status) {
        if (status == 200) {
            setTasks(data.tasks)
        } else {
            setMessage("Ошибка при получении задач")
        }
    }
}