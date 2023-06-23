const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const http = require("http");
var bodyParser = require("body-parser");
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

app.use("/images", express.static(__dirname + "/images"));

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001",
      "https://socket-chat-app-3v3p.onrender.com",
    ],
    methods: ["GET", "POST"],
  },
});

let usersArray = [];
const addUsers = (userId, socketId) => {
  const user = usersArray.find((u) => u.userId === userId);
  if (!user) {
    usersArray.push({ userId, socketId });
  }
};

const removeUsers = (sockeId) => {
  console.log("remove users :", sockeId);
  return usersArray.filter((user) => user.sockeId !== sockeId);
};

const getUsers = (receiverId) => {
  return usersArray.find((user) => user.userId === receiverId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    console.log("user connected connected", userId);
    addUsers(userId, socket.id);
    io.emit("getUsers", usersArray);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log("sendMessage", senderId, receiverId, text);
    const user = getUsers(receiverId);
    console.log("user", user);
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
    console.log("user disconnected");
    socket.disconnect();
    removeUsers(socket.id);
    io.emit("getUsers", usersArray);
  });

  // socket.on("joinRoom", (room) => {
  //   console.log(room);
  //   socket.join(room.room);
  //   socket.broadcast.in(room.room).emit("welcome", { username: room.name });
  // });
  // socket.on("newMessage", ({ newMessage, room }) => {
  //   console.log(newMessage, room);
  //   io.in(room).emit("latestMessages", newMessage);
  // });
});

app.get("/", (req, res) => {
  res.send("chat started");
});

server.listen(port, () => console.log(`server is started at port ${port}`));
