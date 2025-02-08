import './App.css';
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Auth from './Auth';
import { NewTeam, OneTeam, Teams, UserTeams } from './Teams';
import { NewRequest, UserRequests } from './Requests';
import { UserProfile } from './Users';
import { OneChat, UserChats } from './Chats';
import { BsList, BsFillPeopleFill, BsFillPersonFill, BsChatRightDotsFill, BsFillTrophyFill, BsFillBellFill } from "react-icons/bs";
export const backend = "http://localhost:8000"
export const wsAddress = "ws://77.222.46.250/api/chat/:chatid/user/:userid"

export const roles = {
  "Frontend Engineer": ["React", "Angular", "Vue"],
  "Backend Engineer": ["Go", "Java", "Python", "Ruby", "C#", "C++", "Kotlin", "Node JS", "PHP", "Rust"],
  "ML Engineer": ["Python", "C/C++",  "Java", "Javascript"],
  "DevOps Engineer": [],
  "QA Engineer": ["Frontend", "Java", "Go", "Python"],
  "QA Team Lead": ["Frontend", "Java", "Go", "Python"],
  "Frontend Team Lead": ["React", "Angular", "Vue"],
  "Backend Team Lead": ["Go", "Java", "Python", "Ruby", "C#", "C++", "Kotlin", "Node JS", "PHP", "Rust"],
  "UX/UI Designer": [],
  "Data Analyst": ["Python", "C++", "Java", "R", "MATLAB", "Go", "Scala", "Julia"],
  "CTO": [],
  "System Analyst": [],
  "Team Owner": []
}

const mainPage = "http://localhost:3000/"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Auth/>}/>
        <Route exact path='/teams' element={<Teams/>}/>
        <Route exact path='/teams/new' element={<NewTeam/>}/>
        <Route exact path='/requests' element={<UserRequests/>}/>
        <Route exact path='/requests/new/:teamid' element={<NewRequest/>}/>
        <Route exact path='/teams/:userid' element={<UserTeams/>}/>
        <Route exact path='/team/:id' element={<OneTeam/>}/>
        <Route exact path='/user/:id' element={<UserProfile/>}/>
        <Route exact path='/chats' element={<UserChats/>}/>
        <Route exact path='/chat/:id' element={<OneChat/>}/>
        <Route exact path='/notifications' element={<Notifications/>}/>
        {/* 
        
        
        <Route exact path='/profile' elemet={Profile}/>
        <Route exact path='/chat/:id' elemet={Chat}/>
        
        <Route exact path='/user/:id' elemet={User}/>
        
        
         */}
      </Routes>
    </BrowserRouter>
  );
}

export function Header(props) {
  const [state, setState] = useState(false)
  const navigate = useNavigate()
  return (
    <div style={{position: 'fixed', top: '0vh', zIndex: 999}}>
    <div style={{display: 'flex', justifyContent: 'space-around', alignContent: 'center', alignItems: 'center', marginBottom: '3vh', marginTop: '0', background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", height: '15vh'}}>
      <BsList style={{color: "white", position: 'absolute', left: '10vw', top: '6vh', fontSize: 30}} onClick={() => setState(!state)}/>
      
      
      <img src='https://raw.githubusercontent.com/lavatee/facepalm/refs/heads/main/img/eachother.png' style={{width: '15vw', minWidth: 120}}/>
      
    </div>
    {state ?
        <div style={{background: "rgba(255, 255, 255, 0.1)", boxShadow: "0px 4px 70px rgba(0, 0, 0, 0.7)", backdropFilter: "blur(40px)", borderRadius: "0px 50px 50px 50px", left: '10vw', top: '10vh', position: "absolute", display: 'grid', width: "30vw", minWidth: '190px', padding: "10px"}}>
          <h4 onClick={() => navigate("/teams")} style={{fontWeight: props.page == "teams" ? 900 : 400}}><BsFillPeopleFill style={{color: "white", fontSize: 15}}/> Команды</h4>
          <h4 onClick={() => navigate("/chats")} style={{fontWeight: props.page == "chats" ? 900 : 400}}><BsChatRightDotsFill style={{color: "white", fontSize: 15}}/> Чаты</h4>
          <h4 onClick={() => navigate(`/user/${localStorage.getItem("user_id")}`)} style={{fontWeight: props.page == "profile" ? 900 : 400}}><BsFillPersonFill style={{color: "white", fontSize: 15}}/> Профиль</h4>
          <h4 onClick={() => navigate("/notifications")} style={{fontWeight: props.page == "notifications" ? 900 : 400}}><BsFillBellFill style={{color: "white", fontSize: 15}}/> Уведомления</h4>
        </div>
      : ""
    }
    </div>
    
  )
}

function Notifications() {
    const [notifications, setNotifications] = useState(null)
    const [message, setMessage] = useState("")
    useEffect(() => {
        RequestToApi(GetNots, SaveNots)
    }, [])
    return(
      <div>
        <Header page="notifications"/>
        <h1 style={{marginTop: "15vh"}}>Ваши уведомления</h1>
          <h3>{message}</h3>
          <ul>
              {
                notifications ?
                notifications.reverse().map(not => (
                  <li key={not.Id}>
                    <h3>{not.Text}</h3>
                  </li>
                ))
                : ""
              }
          </ul>
      </div>
        
    )
    async function GetNots() {
        const response = await fetch(`${backend}/api/notifications`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
      return response
    }
    async function SaveNots(data, status) {
        if (status == 200) {
            setNotifications(data.notifications)
        }
        else {
            setMessage(data.message)
        }
    }
}

export async function RequestToApi(fetchFunc, saveFunc) { 
  try { 
      const response = await fetchFunc()

      if (response.status === 401) { 
          const refreshResponse = await fetch(`${backend}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({refresh: localStorage.getItem("refresh_token")})
        })

          if (refreshResponse.status === 401) { 
              alert(`Вы не авторизованы, перейдите на главную страницу: ${mainPage}`); 
          } else { 
              const refreshData = await refreshResponse.json();
              localStorage.setItem("access_token", refreshData.access)
              localStorage.setItem("refresh_token", refreshData.refresh)
              const response = await fetchFunc()
              if (response.status === 401) { 
                alert(`Вы не авторизованы, перейдите на главную страницу: ${mainPage}`); 
              } else {
                const data = await response.json();
                saveFunc(data, response.status)
              }
          }
      } else { 
          const data = await response.json();
          saveFunc(data, response.status)
      } 
  } catch (err) { 
      console.error(err); 
  } 
}

export default App;
