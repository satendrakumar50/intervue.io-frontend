const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// In-memory state
let activePoll = null;
let answeredStudents = new Set();
let totalStudents = 0;

// Teacher creates a new poll
io.on("connection", (socket) => {
  console.log("A user connected");

  // Student joins with name
  socket.on("studentJoin", (name) => {
    totalStudents++;
    socket.studentName = name;
    console.log(`${name} joined. Total: ${totalStudents}`);

    // Send active poll if exists
    if (activePoll) socket.emit("newPoll", activePoll);
  });

  // Teacher creates poll
  socket.on("newPoll", (pollData) => {
    if (activePoll && answeredStudents.size < totalStudents) {
      socket.emit("errorMsg", "Wait until all students answer");
      return;
    }

    activePoll = { ...pollData, votes: {} };
    answeredStudents = new Set();
    io.emit("newPoll", activePoll);

    // Timer (60s)
    setTimeout(() => {
      io.emit("pollEnded", activePoll);
      activePoll = null;
    }, 60000);
  });

  // Student submits vote
  socket.on("vote", ({ optionId }) => {
    if (!activePoll) return;
    if (answeredStudents.has(socket.studentName)) return; // already answered

    activePoll.votes[optionId] = (activePoll.votes[optionId] || 0) + 1;
    answeredStudents.add(socket.studentName);

    io.emit("voteUpdate", activePoll);

    // If all students answered early → end poll
    if (answeredStudents.size === totalStudents) {
      io.emit("pollEnded", activePoll);
      activePoll = null;
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    if (socket.studentName) {
      totalStudents = Math.max(0, totalStudents - 1);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
