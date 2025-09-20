import React, { useEffect, useState } from "react";
import socket from "./socket";

function Student() {
  const [name, setName] = useState(sessionStorage.getItem("studentName") || "");
  const [poll, setPoll] = useState(null);
  const [submitted, setSubmitted] = useState(false);
const [tempName, setTempName] = useState(""); 
  useEffect(() => {
    if (name) {
      sessionStorage.setItem("studentName", name);
      socket.emit("studentJoin", name);
    }
  }, [name]);

  useEffect(() => {
    socket.on("newPoll", (pollData) => {
      setPoll(pollData);
      setSubmitted(false);
    });

    socket.on("voteUpdate", (pollData) => setPoll(pollData));
    socket.on("pollEnded", (pollData) => setPoll(pollData));

    return () => {
      socket.off("newPoll");
      socket.off("voteUpdate");
      socket.off("pollEnded");
    };
  }, []);

  const submitVote = (id) => {
    socket.emit("vote", { optionId: id });
    setSubmitted(true);
  };
  if (!name) {
    return (
      <div className="landing-container">
<h1>
  Let’s <span className="font-weight: bold;">Get Started</span>
</h1>
<p>
  If you’re a student, you’ll be able to <strong>submit your answers</strong>, 
  participate in live polls,<br/> and see how your responses compare with your classmates
</p>
 <input
        className="name-input"
        type="text"
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
        placeholder="Your name"
      />

      <button
        className="continue-btn"
        onClick={() => {
          if (tempName.trim()) {
            setName(tempName.trim());
          } else {
            alert("Please enter your name!");
          }
        }}
      >
        Continue
      </button>


      </div>
    );
  }

  if (!poll) return <p>Waiting for teacher to start a poll...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">{poll.question}</h2>
      {!submitted ? (
        poll.options.map((opt) => (

          <button
            key={opt.id}
            onClick={() => submitVote(opt.id)}
            className="block w-full p-2 mt-2 border rounded hover:bg-purple-100"
          >
            {opt.text}
          </button>
        ))
      ) : (
        <div>
          <h3 className="mt-4 font-bold">Live Results</h3>
          {poll.options.map((opt) => (
            <p key={opt.id}>
              {opt.text}: {poll.votes?.[opt.id] || 0}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Student;
