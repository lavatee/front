import React, { useEffect, useState } from "react";
import { backend, Header, RequestToApi, roles } from "./App";
import { useNavigate } from "react-router";
import { BsFileExcel } from "react-icons/bs";
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
            <div>
                <button onClick={() => navigate("/teams/new")}>Создать команду</button>
                <button onClick={() => navigate(`/teams/${localStorage.getItem("user_id")}`)}>Мои команды</button>
                <button onClick={() => navigate("/requests")}>Запросы в мои команды</button>
            </div>
            <h1>Команды, имеющие открытые роли, подходящие вашему стеку:</h1>
            <ul>
                {   teams ?
                    teams.map(team => (
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
            <button onClick={() => navigate("/teams")}>{"< Back"}</button>
            <h1>Создайте свою команду</h1>
            <div>
                <input style={{marginLeft: '20vw'}} placeholder="Name" id="teamName"/>
            </div>
            
            <textarea placeholder="Description" id="teamDescription"/>
            <h2>Добавьте роли, которые нужны в вашей команде</h2>
            <input type="text" list="roles" placeholder="Role" id="roleName" onChange={() => setRole(document.getElementById("roleName").value)}/>
            <datalist id="roles">
                {
                    roleNames.map(roleName => (
                        <option>{roleName}</option>
                    ))
                }
            </datalist>
            <div>{roles[role] != undefined ? 
            <div>
                <div>{roles[role].length > 0 ?
                    <input type="text" list="technologies" placeholder="Main technology of role" id="roleMainTechnology" style={{marginLeft: '20vw'}}/>
                : ""}</div>
                <datalist id="technologies">
                    {
                        roles[role].map(technology => (
                            <option>{technology}</option>
                        ))
                    }
                </datalist>
                <textarea style={{marginLeft: '5vw'}} placeholder="Write what is required or nice to have for this role" id="niceToHave"/>
                <button onClick={AddRole}>Добавить роль</button>
            </div>
            : ""}</div>
            <h2>Роли:</h2>
            <ul>
                {teamRoles.map(role => (
                    <li key={role.serialId}>
                        <h3>{role.Name} {role.MainTechnology}</h3>
                        <p>{role.NiceToHave}</p>
                        <BsFileExcel style={{color: "white", fontSize: 40}} onClick={() => setTeamRoles(teamRoles.filter(teamRole => teamRole.serialId != role.serialId))}/>
                        
                    </li>
                ))}
            </ul>
            <h2>Выбери свою роль</h2>
            <p>Если вы не знаете какую роль выбрать, можете просто выбрать "Team Owner"</p>
            <input type="text" list="roles" placeholder="Role" id="userRoleName" onChange={() => setUserRoleName(document.getElementById("userRoleName").value)}/>
            <datalist id="roles">
                {
                    roleNames.map(roleName => (
                        <option>{roleName}</option>
                    ))
                }
            </datalist>
            <div>{roles[userRoleName] != undefined ? 
            <div>
                <div>{roles[userRoleName].length > 0 ?
                    <input type="text" list="technologies" placeholder="Main technology of role" id="roleMainTechnology"/>
                : ""}</div>
                <datalist id="technologies">
                    {
                        roles ? 
                        roles[userRoleName].map(technology => (
                            <option>{technology}</option>
                        )) : ""
                    }
                </datalist>
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
            <button onClick={() => RequestToApi(CreateTeam, SaveTeam)}>Create</button>
            {
                status == "ok" ?
                <h3>Твоя команда успешно создана</h3>
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
            <button onClick={() => navigate("/teams")}>{"< Back"}</button>
            <h3 style={{color: message == "ok" ? "green" : "red", width: '80vw'}}>{message == "ok" ? "Team was deleted successfuly" : message}</h3>
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
                                        <h3>Enter your password to delete team</h3> : ""
                                }
                                {
                                    teamToDelete == team.Id ?
                                        <input placeholder="Password" id="password" /> : ""
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
            <button onClick={() => navigate("/teams")}>{"< Back"}</button>
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
            setMessage("Bad connection")
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
            setMessage("Bad connection")
        }
    }
}