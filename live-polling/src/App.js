import React, { useState } from "react";
import Teacher from "./Teacher";
import Student from "./Student";
import "./App.css";

function App() {
  const [role, setRole] = useState(null);
  const [selected, setSelected] = useState(null);

  if (role) {
    return role === "teacher" ? <Teacher /> : <Student />;
  }

  return (
    <div className="landing-container">
      {/* Badge */}
      <div className="badge">🎓 Intervue Poll</div>

      {/* Title */}
      <h1 className="landing-title">
        Welcome to the <span>Live Polling System</span>
      </h1>
      <p className="landing-subtitle">
        Please select the role that best describes you to begin using the live polling system
      </p>

      {/* Role Selection */}
      <div className="role-cards">
        <div
          className={`role-card ${selected === "student" ? "active" : ""}`}
          onClick={() => setSelected("student")}
        >
          <h3>I&apos;m a Student</h3>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
        </div>

        <div
          className={`role-card ${selected === "teacher" ? "active" : ""}`}
          onClick={() => setSelected("teacher")}
        >
          <h3>I&apos;m a Teacher</h3>
          <p>Submit answers and view live poll results in real-time.</p>
        </div>
      </div>

      {/* Continue Button */}
      <button
        className="continue-btn"
        disabled={!selected}
        onClick={() => setRole(selected)}
      >
        Continue
      </button>
    </div>
  );
}

export default App;
