import React, { useEffect, useState } from "react";
import { backend, Header, RequestToApi, roles } from "./App";
import { useNavigate } from "react-router";
import { BsFileExcel, BsArrowLeftCircleFill, BsRobot } from "react-icons/bs";
import { FaRobot } from "react-icons/fa6";
import { useParams } from 'react-router-dom';
import './App.css';

export function Teams() {
    const navigate = useNavigate()
    const [teams, setTeams] = useState([])
    const [err, setErr] = useState("")
    async function GetTeams() {
        const response = await fetch(`${backend}/api/teams`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    async function SaveTeams(data, status) {
        if (status == 200) {
            if (data.teams != null) {
                setTeams(data.teams)
            }
        }
        else {
            setErr(data.message)
        }
    }
    
    useEffect(() => {
        RequestToApi(GetTeams, SaveTeams)
    }, [])
    return(
        <div>
            <Header page="teams"/>
            <div style={{display: "flex", justifyContent: "space-between", flexDirection: "row", marginTop: "15vh", maxWidth: "800px"}}>
                <button onClick={() => navigate("/teams/new")}>Создать команду</button>
                <button onClick={() => navigate(`/teams/${localStorage.getItem("user_id")}`)}>Мои команды</button>
                <button onClick={() => navigate("/requests")}>Запросы в мои команды</button>
            </div>
            <h1>Команды, имеющие открытые роли, подходящие вашему стеку:</h1>
            <ul>
                {   teams ?
                    teams.reverse().map(team => (
                        <li key={team.Id} onClick={() => navigate(`/team/${team.Id}`)}>
                            <h2>{team.ProjectName}</h2>
                            <p>{team.Description}</p>
                            {/* <h3>Needed:</h3>
                            {
                                team.Roles.map(role => (
                                    <p>{`${role.Name} ${role.MainTecnhology}`}</p>
                                ))
                            } */}
                        </li>
                    ))
                    : ""
                }
                
                
            </ul>
            
        </div>
    )
    
}

export function NewTeam() {
    const navigate = useNavigate()
    const [role, setRole] = useState("")
    const [teamRoles, setTeamRoles] = useState([])
    const roleNames = []
    const [userRole, setUserRole] = useState(null)
    const [status, setStatus] = useState("")
    const [userRoleName, setUserRoleName] = useState("")
    const [isAdded, setIsAdded] = useState(false)
    for (let roleName in roles) {
        roleNames.push(roleName)
    }
    let [serialId, setSerialId] = useState(0)
    return(
        <div>
            <Header page="teams"/>
            <button style={{marginTop: "15vh"}} onClick={() => navigate("/teams")}><BsArrowLeftCircleFill style={{fontSize: 23}}/></button>
            <h1>Создайте свою команду</h1>
            <div>
                <input placeholder="Имя команды" id="teamName" autocomplete="off"/>
            </div>
            
            <textarea placeholder="Описание" id="teamDescription"/>
            <p>Если вы не знаете, какие роли вам нужны, вы можете сгенерировать их на основе названия и описания команды с помощью нашего ИИ:</p>
            <button onClick={() => RequestToApi(GenerateRoles, SaveRoles)}>Сгенерировать роли</button>
            <h2>Добавьте роли, которые нужны в вашей команде</h2>
            <select id="roleName" onChange={() => setRole(document.getElementById("roleName").value)}>
                <option value="" disabled selected>Роль</option>
                {
                    roleNames.map(roleName => (
                        <option value={roleName}>{roleName}</option>
                    ))
                }
            </select>
            <div>{roles[role] != undefined ? 
            <div>
                <div>{roles[role].length > 0 ?
                    <select id="roleMainTechnology">
                        <option value="" disabled selected>Главная технология роли</option>
                        {
                            roles[role].map(technology => (
                                <option value={technology}>{technology}</option>
                            ))
                        }
                    </select>
                : ""}</div>
                
                <textarea style={{marginLeft: '5vw'}} placeholder="Write what is required or nice to have for this role" id="niceToHave"/>
                <button onClick={AddRole}>Добавить роль</button>
            </div>
            : ""}</div>
            <h2>Роли:</h2>
            <ul>
                {teamRoles.map(role => (
                    <li key={role.serialId}>
                        <h3>{role?.Name ? role.Name : role.Role} {role.MainTechnology}</h3>
                        <p>{role.NiceToHave}</p>
                        <BsFileExcel style={{color: "white", fontSize: 40}} onClick={() => setTeamRoles(teamRoles.filter(teamRole => teamRole.serialId != role.serialId))}/>
                        
                    </li>
                ))}
            </ul>
            <h2>Выбери свою роль</h2>
            <p>Если вы не знаете какую роль выбрать, можете просто выбрать "Team Owner"</p>
            <select id="userRoleName" onChange={() => setUserRoleName(document.getElementById("userRoleName").value)}>
                <option value="" disabled selected>Роль</option>
                {
                    roleNames.map(roleName => (
                        <option value={roleName}>{roleName}</option>
                    ))
                }
            </select>
            <div>{roles[userRoleName] != undefined ? 
            <div>
                <div>{roles[userRoleName].length > 0 ?
                    <select id="roleMainTechnology">
                        <option value="" disabled selected>Главная технология роли</option>
                        {
                            roles[userRoleName].map(technology => (
                                <option value={technology}>{technology}</option>
                            ))
                        }
                    </select>
                : ""}</div>
                <button onClick={AddUserRole}>Сделать это своей ролью</button>
            </div>
            : ""}</div>
            <h2>Твоя роль:</h2>
            
                {
                    userRole?.Name ?
                        <div>
                            <h3>{userRole.Name} {userRole.MainTechnology}</h3>
                        </div>
                    : ""
                }
            <button onClick={() => RequestToApi(CreateTeam, SaveTeam)}>Создать</button>
            {
                status == "ok" ?
                <h3 style={{color: "green"}}>Команда успешно создана</h3>
                :
                <h3>{status == "rpc error: code = InvalidArgument desc = team must have a creator" ? "Выберите свою роль" : "Заполните все поля или добавьте роли"}</h3>
            }
        </div>
    )
    function AddRole() {
        if (document.getElementById("roleMainTechnology") != null) {
            let isCorrectTech = false
            for (let technology of roles[role]) {
                if (technology == document.getElementById("roleMainTechnology").value) {
                    isCorrectTech = true
                }
            }
            if (!isCorrectTech) {
                return
            }
        }
        
        if (role == "") {
            return
        }
        
        setTeamRoles([...teamRoles, {serialId: ++serialId, Name: role, MainTechnology: document.getElementById("roleMainTechnology") != null ? document.getElementById("roleMainTechnology").value : "", NiceToHave: document.getElementById("niceToHave").value, IsOpen: true, TeamId: 0, Id: 0}])
        document.getElementById("roleName").value = ""
        if (document.getElementById("roleMainTechnology") != null) {
            document.getElementById("roleMainTechnology").value = ""
        }
        document.getElementById("niceToHave").value = ""
        console.log(teamRoles)
        setIsAdded(true)
        setRole("")
        setSerialId(serialId + 1)
    }
    function AddUserRole() {
        if (userRoleName == "") {
            return
        } 
        if (document.getElementById("roleMainTechnology") != null) {
            let isCorrectTech = false
            for (let technology of roles[userRoleName]) {
                if (technology == document.getElementById("roleMainTechnology").value) {
                    isCorrectTech = true
                }
            }
            if (!isCorrectTech) {
                return
            }
        }
        console.log("userRole: ", userRoleName)
        setUserRole({serialId: ++serialId, Name: userRoleName, MainTechnology: document.getElementById("roleMainTechnology") ? document.getElementById("roleMainTechnology").value : "", NiceToHave: "", IsOpen: false, TeamId: 0, Id: 1})
        document.getElementById("userRoleName").value = ""
        if (document.getElementById("roleMainTechnology") != null) {
            document.getElementById("roleMainTechnology").value = ""
        }
        if (document.getElementById("niceToHave") != null) {
            document.getElementById("niceToHave").value = ""
        }
        setUserRoleName("")
    }
    function SaveTeam(data, status) {
        if (status == 200) {
            setStatus("ok")
            setTeamRoles([])
            document.getElementById("teamName").value = ""
            document.getElementById("teamDescriptions").value = ""
            setUserRole(null)
        }
        else {
            if (status == 500) {
                setStatus(data.message)
            }
        }
    }
    async function CreateTeam() {
        const allRoles = [...teamRoles]
        allRoles.push(userRole)
        const data = {
            projectName: document.getElementById("teamName").value,
            description: document.getElementById("teamDescription").value,
            roles: allRoles
        }
        const response = await fetch(`${backend}/api/teams`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(data)
        })
        return response
    }
    async function GenerateRoles() {
        const response = await fetch(`${backend}/api/ai_roles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({ProjectName: document.getElementById("teamName").value, Description: document.getElementById("teamDescription").value})
        })
        return response
    }
    async function SaveRoles(data, status) {
        if (status == 200) {
            if (!data?.roles) {
                setStatus("Ошибка при генерации ролей")
                return
            }
            for (let i = 0; i < data.roles.length; i++) {
                data.roles[i].serialId = i
                data.roles[i].IsOpen = true
                data.roles[i].TeamId = 0
                data.roles[i].Id = 0
                data.roles[i].Name = data.roles[i].Role
            }
            setSerialId(data.roles[data.roles.length - 1].serialId)
            setTeamRoles(data?.roles)
        } else {
            setStatus("Ошибка при генерации ролей")
        }
    }
}

export function UserTeams() {
    const params = useParams()
    const navigate = useNavigate()
    const [teams, setTeams] = useState([])
    const [message, setMessage] = useState("")
    const [teamToDelete, setTeamToDelete] = useState(0)
    async function GetUserTeams() {
        const response = await fetch(`${backend}/api/users/${params.userid}/teams`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveTeams(data, status) {
        if (status == 200) {
            setTeams(data.teams)
        }
        else {
            setMessage(data.message)
        }
    }
    useEffect(() => {RequestToApi(GetUserTeams, SaveTeams)}, [])
    return(
        <div>
            <button onClick={() => navigate("/teams")}><BsArrowLeftCircleFill style={{fontSize: 23}}/></button>
            <h3 style={{color: message == "ok" ? "green" : "red", width: '80vw'}}>{message == "ok" ? "Команда была удалена успешно" : message}</h3>
            <ul>
                {
                    teams ?
                    teams.map(team => (
                        <div>
                            <li key={team.Id} onClick={teamToDelete == team.Id ? () => {} : () => navigate(`/team/${team.Id}`)}>
                                <h2>{team.ProjectName}</h2>
                                <p>{team.Description}</p>
                                {
                                    teamToDelete == team.Id ?
                                        <h3>Введи свой пароль чтобы удалить команду</h3> : ""
                                }
                                {
                                    teamToDelete == team.Id ?
                                        <input placeholder="Пароль" id="password" /> : ""
                                }
                            </li>
                            {
                                team.CreatorId == localStorage.getItem("user_id") ? <button onClick={teamToDelete == team.Id ? () => RequestToApi(() => DeleteTeam(team.Id), SaveDeleteTeam) : () => setTeamToDelete(team.Id)}>Delete team</button> : ""
                            }
                        </div>
                        
                    )) : ""
                }
            </ul>
            
        </div>
    )
    async function DeleteTeam(id) {
        if (document.getElementById("password").value == "") {
            setTeamToDelete(0)
            return
        }
        const response = await fetch(`${backend}/api/teams/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({password: document.getElementById("password").value})
        })
        return response
    }
    function SaveDeleteTeam(data, status) {
        if (status == 200) {
            setMessage("ok")
            setTeams(teams.filter(team => team.Id != teamToDelete))
        }
        else {
            setMessage(data.message)
        }
    }
}

export function OneTeam() {
    const params = useParams()
    const [team, setTeam] = useState(null)
    const [creator, setCreator] = useState("")
    const [message, setMessage] = useState("")
    const navigate = useNavigate()
    useEffect(() => {
        RequestToApi(GetTeam, SaveTeam)
        
    }, [])
    useEffect(() => {RequestToApi(GetCreator, SaveCreator)
    }, [team])
    return(
        <div>
            <button onClick={() => navigate("/teams")}><BsArrowLeftCircleFill style={{fontSize: 23}}/></button>
            <h2>{message}</h2>
            {
                team ?
                <div>
                    <h1>{team.ProjectName}</h1>
                    <h2>Creator: <b onClick={() => navigate(`/user/${team.CreatorId}`)}>{creator}</b></h2>
                    <p>{team.Description}</p>
                    <ul>
                        {
                            team.Roles ?
                            team.Roles.map(role => (
                                role.IsOpen ?
                                <li key={role.Id}>
                                    <h3>Name: {role.Name}</h3>
                                    {
                                        role.MainTechnology ? <h3>Main technology: {role.MainTechnology}</h3> : ""
                                    }
                                    <p>{role.NiceToHave}</p>
                                </li> : ""
                            )) : ""
                        }
                    </ul>
                    <button onClick={() => navigate(`/requests/new/${team.Id}`)}>Join</button>
                </div>
                : ""
            }
        </div>
    )
    async function GetTeam() {
        const response = await fetch(`${backend}/api/teams/${params.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveTeam(data, status) {
        if (status == 200) {
            setTeam(data.team)
        }
        else {
            setMessage("Плохое соединение")
        }
    }
    async function GetCreator() {
        const response = await fetch(`${backend}/api/teams/users/${team.CreatorId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    function SaveCreator(data, status) {
        if (status == 200) {
            setCreator(data.name)
        }
        else {
            setMessage("Плохое соединение")
        }
    }
}