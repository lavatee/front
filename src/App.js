import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Auth from './Auth';
import { NewTeam, OneTeam, Teams, UserTeams } from './Teams';
import { NewRequest, UserRequests } from './Requests';
import { UserProfile } from './Users';
import { OneChat, UserChats } from './Chats';

export const backend = "/api"
export const wsAddress = "ws://77.222.46.202/api/chat/:chatid/user/:userid"

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
  const navigate = useNavigate()
  return (
    <div style={{display: 'flex', justifyContent: 'space-around', alignContent: 'center', alignItems: 'center', marginBottom: '3vh', marginTop: '3vh'}}>
      <img src='https://raw.githubusercontent.com/lavatee/facepalm/refs/heads/main/img/eachother.png' style={{width: '20vw', minWidth: 120}}/>
      <h4 onClick={() => navigate("/teams")} style={{fontWeight: props.page == "teams" ? 900 : 600}}>Команды</h4>
      <h4 onClick={() => navigate("/chats")} style={{fontWeight: props.page == "chats" ? 900 : 600}}>Чаты</h4>
      <h4 onClick={() => navigate(`/user/${localStorage.getItem("user_id")}`)} style={{fontWeight: props.page == "profile" ? 900 : 600}}>Профиль</h4>
    </div>
  )
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
              alert("Ваш токен истек"); 
          } else { 
              const refreshData = await refreshResponse.json();
              localStorage.setItem("access_token", refreshData.access)
              localStorage.setItem("refresh_token", refreshData.refresh)
              const response = await fetchFunc()
              if (response.status === 401) { 
                alert("Ваш токен истек"); 
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
