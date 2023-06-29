const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database/database");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./routes/routes")(app);
require("./routes/conversation")(app);
require("./routes/messages")(app);

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

const server = app.listen(port, () =>
  console.log(`Server is started at port ${port}`)
);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://socket-chat-app-3v3p.onrender.com",
      "https://new-repo-client.vercel.app",
      "https://new-repo-client-mrvikki90.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

let usersArray = [];

const addUser = (userId, socketId) => {
  const user = usersArray.find((u) => u.userId === userId);
  if (!user) {
    console.log(`User added with userId ${userId} socketId ${socketId}`);
    usersArray.push({ userId, socketId });
    console.log("User added to socket", usersArray);
  }
};

const removeUser = (socketId) => {
  console.log("Remove user:", socketId);
  usersArray = usersArray.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return usersArray.find((user) => user.userId === receiverId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    console.log("User connected:", {
      userId: userId,
      socketId: socket.id,
    });
    addUser(userId, socket.id);
    io.emit("getUsers", usersArray);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log("sendMessage:", senderId, receiverId, text);
    const user = getUser(receiverId);
    console.log("User:", user);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
      console.log("Message emitted successfully to socket ID:", user.socketId);
    } else {
      console.log("User not found with receiver ID:", receiverId);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    removeUser(socket.id);
    io.emit("getUsers", usersArray);
  });
});

app.get("/", (req, res) => {
  res.send("Chat started");
});
