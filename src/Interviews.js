import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { backend, Header, RequestToApi } from "./App";
import { useParams } from 'react-router-dom';
import './App.css';
import { BsArrowLeftCircleFill } from "react-icons/bs";
import MonacoEditor from 'react-monaco-editor';
export function Interview() {
    const navigate = useNavigate()
    const params = useParams()
    const [question, setQuestion] = useState(null)
    const [message, setMessage] = useState("")
    const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [currentSolution, setCurrentSolution] = useState("")
    const [isCode, setIsCode] = useState(true)
    const [language, setLanguage] = useState("python")
    const [interviewResults, setInterviewResults] = useState(null)
    const [taskReview, setTaskReview] = useState(0)
    const [solution, setSolution] = useState("")
    const [isSent, setIsSent] = useState(false)
    useEffect(() => {
        RequestToApi(GetCurrentQuestion, SaveQuestion)
    }, [])
    function editorDidMount(editor, monaco) {
        console.log('editorDidMount', editor);
        editor.focus();
    }
    
    return(
        <div>
            <button onClick={() => navigate("/teams")}><BsArrowLeftCircleFill style={{fontSize: 23}}/></button>
            <h3>{message}</h3>
            <h2>Собеседование в {question?.TeamProjectName}</h2>
            
            
            {
                interviewResults ?
                <div>
                    <ul>
                        {
                            interviewResults.map(result => (
                                <li>
                                    <h3 style={{color: result?.IsCorrect ? "#40EE9D" : "#FF5B5B"}}>{result?.QuestionIndex}: {result?.IsCorrect ? "Верно" : "Неверно"}</h3>
                                </li>
                            ))
                        }
                        <li>
                            <h3 style={{color: getRatingColor(taskReview)}}>5: {taskReview}/10</h3>
                        </li>
                    </ul>
                </div>
                :
                <div>
                    <InterviewQuestion/>
                </div>
                
            }
        </div>
    )
    
    function getRatingColor(rating) {
        if (rating < 5) {
            return "#FF5B5B"
        }
        if (rating < 8) {
            return "#FFEC5B"
        }
        return "#40EE9D"
    }
    async function GetCurrentQuestion() {
        const response = await fetch(`${backend}/api/interviews/${params.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    async function SaveQuestion(data, status) {
        if (status == 200) {
            setQuestion(data.question)
            setCurrentQuestionIndex(data.question?.Index)
            setMessage("")
        } else {
            setMessage("Ошибка при получении вопроса")
        }
    }
    async function AnswerTheQuestion() {
        const response = await fetch(`${backend}/api/interviews/next`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify({answerIndex: currentAnswerIndex, interviewId: Number(params.id)})
        })
        return response
    }
    async function SaveAnswer(data, status) {
        if (status == 200) {
            setQuestion(data.question)
            setCurrentAnswerIndex(0)
            setCurrentQuestionIndex(data.question?.Index)
        } else {
            setMessage("Ошибка при получении вопроса")
        }
    }
    
    function InterviewQuestion() {
        const [currentSolution, setCurrentSolution] = useState("")
        function onChange(newValue, e) {
            setCurrentSolution(newValue)
        }
        return(
            <div>
                <p>{currentQuestionIndex} вопрос из 5</p>
                <h3>{question?.Text}</h3>
                {
                currentQuestionIndex == 5 ?
                (
                    isCode ?
                    <div>
                        {/* <p>Язык программирования:</p>
                            <select onChange={(e) => setLanguage(e.target.value)} value={language}>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="c">C</option>
                                <option value="go">Go</option>
                                <option value="c#">C#</option>
                                <option value="c++">C++</option>
                                <option value="java">Java</option>
                                <option value="rust">Rust</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="dockerfile">Dockerfile</option>
                                <option value="swift">Swift</option>
                                <option value="kotlin">Kotlin</option>
                                <option value="ruby">Ruby</option>
                                <option value="php">PHP</option>
                                <option value="sql">SQL</option>
                            </select> */}
                            <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                                <button style={isCode ? {backgroundColor: "#685A72"} : {}} onClick={() => setIsCode(true)}>Код</button>
                                <button style={!isCode ? {backgroundColor: "#685A72"} : {}} onClick={() => setIsCode(false)}>Текст</button>
                            </div>
                            <MonacoEditor
                                width="80vw"
                                height="60vh"
                                theme="vs-dark"
                                language="javascript"
                                value={currentSolution}
                                onChange={onChange}
                                editorDidMount={editorDidMount}
                                options={{lineNumbers: "on", readOnly: false}}
                            />
                        </div>
                        : 
                        <div>
                            <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                                <button style={isCode ? {backgroundColor: "#685A72"} : {}} onClick={() => setIsCode(true)}>Код</button>
                                <button style={!isCode ? {backgroundColor: "#685A72"} : {}} onClick={() => setIsCode(false)}>Текст</button>
                            </div>
                            <textarea value={currentSolution} placeholder="Решение" onChange={(e) => setCurrentSolution(e.target.value)}/>
                        </div>
                    )
                    
                    :
                    <ul style={{marginBottom: "10vh"}}>
                        {
                            question?.Answers ?
                            question?.Answers.map(answer => (
                                <li className={currentAnswerIndex == answer?.Index ? "chosenAnswer" : "answer"} onClick={() => setCurrentAnswerIndex(answer?.Index)}>
                                    <p>{answer?.Text}</p>
                                </li>
                            ))
                            : ""
                        }
                    </ul>
                }
                {
                    isSent ?
                    <div style={{zIndex: 999, position: 'fixed', top: "90vh"}} className="loader"><img src="/img/loading.png" className="dot"/><img src="/img/loading.png" className="dot"/><img src="/img/loading.png" className="dot"/></div>
                    :
                    <button style={{zIndex: 999, position: 'fixed', top: "90vh"}} onClick={currentQuestionIndex < 5 ? () => RequestToApi(AnswerTheQuestion, SaveAnswer) : () => RequestToApi(CompleteInterview, SaveInterviewCompleting)}>Ответить</button>
                }
            </div>
        )
        async function CompleteInterview() {
            setIsSent(true)
            const response = await fetch(`${backend}/api/interviews/complete`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`
                },
                body: JSON.stringify({interviewId: Number(params.id), solving: currentSolution})
            })
            return response
        }
        async function SaveInterviewCompleting(data, status) {
            if (status == 200) {
                setInterviewResults(data.results.filter(result => result.QuestionIndex != 5))
                setTaskReview(data?.rating)
            } else {
                setMessage("Ошибка при получении результатов собеседования")
            }
            setIsSent(false)
        }
    }
}

export function UserInterviews() {
    const [interviews, setInterviews] = useState(null)
    const [message, setMessage] = useState("")
    const navigate = useNavigate()
    useEffect(() => {
        RequestToApi(GetUserInterviews, SaveInterviews)
    }, [])
    return(
        <div>
            <Header page="interviews"/>
            <h1 style={{marginTop: "19vh"}}>Твои активные интервью:</h1>
            
            {
                interviews ?
                <ul>
                    {
                        interviews.map(interview => (
                            <li>
                                <h3>{interview?.TeamProjectName}</h3>
                                <p>Роль: {interview?.Role + (interview?.MainTechnology ? " " + interview?.MainTechnology : "")}</p>
                                <button onClick={() => navigate(`/interview/${interview?.Id}`)}>Продолжить</button>
                            </li>
                        ))
                    }
                </ul>
                :
                <h2>{message ? message : "У вас нет активных интерью"}</h2>
            }
        </div>
    )
    async function GetUserInterviews() {
        const response = await fetch(`${backend}/api/interviews`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        })
        return response
    }
    async function SaveInterviews(data, status) {
        if (status == 200) {
            setInterviews(data.interviews)
        } else {
            setMessage("Ошибка при получении активных собеседований")
        }
    }
}