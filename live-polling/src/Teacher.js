// src/Teacher.js
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000");

export default function Teacher() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [timer, setTimer] = useState(60);
  const [activePoll, setActivePoll] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    socket.on("newPoll", (poll) => setActivePoll(poll));
    socket.on("voteUpdate", (poll) => setActivePoll(poll));
    socket.on("pollEnded", () => setActivePoll(null));
    socket.on("pollHistory", (polls) => setHistory(polls));

    return () => {
      socket.off("newPoll");
      socket.off("voteUpdate");
      socket.off("pollEnded");
      socket.off("pollHistory");
    };
  }, []);

  const addOption = () => setOptions([...options, ""]);
  const updateOption = (i, val) => {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  };

  const setCorrect = (i, val) => {
    setCorrectAnswers({ ...correctAnswers, [i]: val });
  };

  const createPoll = () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      alert("Please fill question and all options");
      return;
    }
    socket.emit("newPoll", {
      question,
      timer,
      options: options.map((opt, i) => ({
        id: i + 1,
        text: opt,
        isCorrect: correctAnswers[i] || false,
      })),
    });
    setQuestion("");
    setOptions(["", ""]);
    setCorrectAnswers({});
  };

  const calculatePercent = (poll, optionId) => {
    const totalVotes = Object.values(poll.votes || {}).length;
    if (totalVotes === 0) return 0;
    const count = Object.values(poll.votes).filter((v) => v === optionId).length;
    return Math.round((count / totalVotes) * 100);
  };

  return (
    <div className="teacher-container">
      {/* Badge */}
      <div className="badge">⭐ Intervue Poll</div>

      {/* Title + Subtitle */}
      <h1 className="teacher-title">
        Let’s <span>Get Started</span>
      </h1>
      <p className="teacher-subtitle">
        you’ll have the ability to create and manage polls, ask questions, and
        monitor your students' responses in real-time.
      </p>

     

      {/* Question Input */}
      <div className="question-section">
        <div className="question-header">
        <label className="label">Enter your question</label>
        <select
            className="timer-select"
            value={timer}
            onChange={(e) => setTimer(Number(e.target.value))}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
          </select>
          </div>
        <div className="question-row">
          <textarea
            className="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={100}
            placeholder="Type your question here..."
          />
          
        </div>
        <div className="char-count">{question.length}/100</div>
      </div>

      {/* Options Section */}
      <div className="options-section">
        <label className="label">Edit Options</label>
        <div className="options-list">
          {options.map((opt, i) => (
            <div key={i} className="option-row">
              <div className="option-number">{i + 1}</div>
              <input
                type="text"
                className="option-input"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              <div className="correct-toggle">
                <span>Is it Correct?</span>
                <label>
                  <input
                    type="radio"
                    checked={correctAnswers[i] === true}
                    onChange={() => setCorrect(i, true)}
                  />{" "}
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    checked={correctAnswers[i] === false}
                    onChange={() => setCorrect(i, false)}
                  />{" "}
                  No
                </label>
              </div>
            </div>
          ))}
        </div>
        <button className="add-option-btn" onClick={addOption}>
          + Add More option
        </button>
      </div>

      {/* Ask Button */}
      <div className="footer">
        <button className="ask-btn" onClick={createPoll}>
          Ask Question
        </button>
      </div>

      {/* Poll History */}
      <div className="history-section">
        <h3 className="section-title">Poll History</h3>
        {history.length === 0 && <p></p>}
        {history.map((p, idx) => (
          <div key={idx} className="history-item">
            <h4 className="poll-question">
              {p.question} {p.active && "(Active)"}
            </h4>
            {p.options.map((opt, i) => {
              const percent = calculatePercent(p, opt.id);
              return (
                <div key={i} className="poll-result-row">
                  <span className="poll-option-text">{opt.text}</span>
                  <div className="poll-bar">
                    <div
                      className="poll-bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="poll-percent">{percent}%</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

       {/* Active Poll Results */}
      {activePoll && (
        <div className="active-poll">
          <h3 className="poll-question">{activePoll.question}</h3>
          {activePoll.options.map((opt, i) => {
            const percent = calculatePercent(activePoll, opt.id);
            return (
              <div key={i} className="poll-result-row">
                <span className="poll-option-text">{opt.text}</span>
                <div className="poll-bar">
                  <div
                    className="poll-bar-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="poll-percent">{percent}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
