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
    const [isRef, setIsRef] = useState(localStorage.getItem("action") == "ref" && localStorage.getItem("refLink") ? true : false)
    // if (localStorage.getItem("action") == "ref" && localStorage.getItem("refLink")) {
    //     setIsRef(true)
    //     console.log("REF")
    // }
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
            <h2 style={{marginTop: "16vh"}}>{err}</h2>
            <div style={{display: "flex", justifyContent: "space-between", flexDirection: "row", marginTop: "2vh", maxWidth: "800px"}}>
                <button onClick={() => navigate("/teams/new")}>Создать новую команду</button>
                <button onClick={() => navigate(`/teams/${localStorage.getItem("user_id")}`)}>Команды созданные мной</button>
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
            {
                isRef ?
                <RefInvite/>
                : ""
            }
            
        </div>
    )
    function RefInvite() {
            const [refInfo, setRefInfo] = useState(null)
            const [refMessage, setRefMessage] = useState("")
            useEffect(() => {
                RequestToApi(GetRefInfo, SaveRefInfo)
            }, [])
            return (
                <div style={{height: "100%", width: "101%", position: "fixed", background: "rgba(0, 0, 0, 0.4)", zIndex: "999"}}>
                    <div style={{width: "75vw", maxWidth: "500px", background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", padding: "25px 10px 25px 10px", marginTop: "10vh", borderRadius: "40px"}}>
                        <h2>{refInfo?.userName} приглашает вас в команду {refInfo?.projectName}</h2>
                        <h3>На роль: {refInfo?.roleName} {refInfo?.mainTechnology ? " " + refInfo?.mainTechnology : ""}</h3>
                        <h3>Сообщение: {refInfo?.message}</h3>
                        <h2>{refMessage}</h2>
                        <button onClick={() => RequestToApi(JoinByRef, SaveJoinByRef)}>Вступить в команду</button>
                        <button onClick={() => setIsRef(false)}>Отмена</button>
                    </div>
                </div>
            );
            async function GetRefInfo() {
                    const response = await fetch(`${backend}/api/refs/${localStorage.getItem("refLink")}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                        }
                    })
                    return response
            }
            function SaveRefInfo(data, status) {
                if (status == 200) {
                    setRefInfo({userName: data.userName, roleName: data.roleName, projectName: data.projectName, mainTechnology: data.mainTechnology, message: data.message})
                } else {
                    setErr("Ссылка недействительна")
                    setIsRef(false)
                }
            }
            async function JoinByRef() {
                const response = await fetch(`${backend}/api/refs/join`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    },
                    body: JSON.stringify({link: localStorage.getItem("refLink")})
                })
                return response
            }
            function SaveJoinByRef(data, status) {
                if (status == 200) {
                    setErr("Вы успешно вступили в команду, зайдите в раздел Чаты")
                    setIsRef(false)
                    
                } else {
                    setErr("Ссылка недействительна")
                    setIsRef(false)
                }
                localStorage.setItem("action", "")
                localStorage.setItem("refLink", "")
            }
    }
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
    const [isLoading, setIsLoading] = useState(false)
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
            {
                !isLoading ?
                <button onClick={GenerateRoles}>Сгенерировать роли</button>
                :
                <div style={{flexDirection: "row", marginTop: "10px"}} className="loader"><img src="/img/loading.png" className="dot"/><img src="/img/loading.png" className="dot"/><img src="/img/loading.png" className="dot"/></div>
            }
            
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
        setIsLoading(true)
        const socket = new WebSocket(`ws://185.56.162.37/api/ws/ws/roles/${document.getElementById("teamName").value}/${document.getElementById("teamDescription").value}`);
        socket.onmessage = SaveRoles
        socket.onclose = ()  => {
            setIsLoading(false)
        }
    }
    async function SaveRoles(event) {
        setIsLoading(false)
        const roles = JSON.parse(event.data)
        for (let i = 0; i < roles.length; i++) {
            roles[i].serialId = i
            roles[i].IsOpen = true
            roles[i].TeamId = 0
            roles[i].Id = 0
            roles[i].Name = roles[i].Role
        }
        setSerialId(roles[roles.length - 1].serialId)
        setTeamRoles(roles)
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
                                team.CreatorId == localStorage.getItem("user_id") ? <button onClick={teamToDelete == team.Id ? () => RequestToApi(() => DeleteTeam(team.Id), SaveDeleteTeam) : () => setTeamToDelete(team.Id)}>Удалить</button> : ""
                                
                            }
                            {
                                team.CreatorId == localStorage.getItem("user_id") ? <button onClick={() => navigate(`/edit_team/${team.Id}`)}>Редактировать</button> : ""
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
                    <h2>Создатель: <b onClick={() => navigate(`/user/${team.CreatorId}`)}>{creator}</b></h2>
                    <p style={{background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", padding: "15px", borderRadius: "40px"}}>{team.Description}</p>
                    <ul>
                        {
                            team.Roles ?
                            team.Roles.map(role => (
                                role.IsOpen ?
                                <li key={role.Id}>
                                    <h3>Роль: {role.Name}</h3>
                                    {
                                        role.MainTechnology ? <h3>Стек: {role.MainTechnology}</h3> : ""
                                    }
                                    <p>{role.NiceToHave}</p>
                                </li> : ""
                            )) : ""
                        }
                    </ul>
                    <button onClick={() => navigate(`/requests/new/${team.Id}`)}>Вступить</button>
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

export function EditTeam() {
    const navigate = useNavigate()
    const [role, setRole] = useState("")
    const [teamRoles, setTeamRoles] = useState([])
    const roleNames = []
    const [userRole, setUserRole] = useState(null)
    const [status, setStatus] = useState("")
    const [userRoleName, setUserRoleName] = useState("")
    const [isAdded, setIsAdded] = useState(false)
    const [teamName, setTeamName] = useState("")
    const [description, setDescription] = useState("")
    useEffect(() => {
        RequestToApi(GetTeam, SaveTeam)
        
    }, [])
    const params = useParams()
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
                <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Имя команды" id="teamName" autocomplete="off"/>
            </div>
            
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" id="teamDescription"/>
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
            <h2>Открытые роли:</h2>
            <ul>
                {teamRoles.map(role => (
                    <li key={role.serialId}>
                        <h3>{role?.Name ? role.Name : role.Role} {role.MainTechnology}</h3>
                        <p>{role.NiceToHave}</p>
                        <BsFileExcel style={{color: "white", fontSize: 40}} onClick={() => setTeamRoles(teamRoles.filter(teamRole => teamRole.serialId != role.serialId))}/>
                        
                    </li>
                ))}
            </ul>
            
            <button onClick={() => RequestToApi(EditTeam, SaveTeamEditing)}>Изменить</button>
            {
                status == "ok" ?
                <h3 style={{color: "green"}}>Команда успешно отредактирована</h3>
                :
                <h3>{status}</h3>
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
            setTeamRoles(data.team.Roles.filter(role => role?.IsOpen))
            setTeamName(data.team.ProjectName)
            setDescription(data.team.Description)
        }
        else {
            setStatus("Плохое соединение")
        }
    }
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
    
    function SaveTeamEditing(data, status) {
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
    async function EditTeam() {
        const allRoles = [...teamRoles]
        allRoles.push(userRole)
        const data = {
            projectName: document.getElementById("teamName").value,
            description: document.getElementById("teamDescription").value,
            roles: allRoles
        }
        const response = await fetch(`${backend}/api/teams/${params.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(data)
        })
        return response
    }
}
