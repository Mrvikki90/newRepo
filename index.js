const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const messagesController = require("./controllers/messages.controller");
const db = require("./database/database");
const isMessageSaved = db.message;

const Conversation = db.conversation;

const port = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/images", express.static(__dirname + "/images"));

require("./routes/routes")(app);
require("./routes/conversation")(app);
require("./routes/messages")(app);
require("./routes/groups")(app);

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
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let usersArray = [];
let onlineUsers = []; // Store online user IDs
const socketToUser = new Map(); // Map to track socket-to-user mapping

const addUser = async (userId, socketId) => {
  const user = usersArray.find((u) => u.userId === userId);
  if (!user) {
    const offlineUserMessages = await messagesController.getOfflineMessages(
      userId
    );

    if (!offlineUserMessages) {
      console.log(`User added with userId ${userId} socketId ${socketId}`);
      usersArray.push({ userId, socketId });
    } else {
      io.to(socketId).emit("retrieveOfflineMessages", offlineUserMessages);
      // await messagesController.clearOfflineMessages(userId);
      usersArray.push({ userId, socketId });
    }
  }
};

const removeUser = (socketId) => {
  usersArray = usersArray.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return usersArray.find((user) => user.userId === receiverId);
};

// Function to emit offline messages
const emitOfflineMessages = async (userId) => {
  console.log(`get user with userId  : ${userId}`);
  const user = getUser(userId);
  console.log("get user", user);
  if (user) {
    const offlineUserMessages = await messagesController.getOfflineMessages(
      userId
    );
    console.log("Offline messages user", user);
    if (offlineUserMessages) {
      io.to(user.socketId).emit("retrieveOfflineMessages", offlineUserMessages);
    }
  }
};

// Call the setIOInstance function and pass the io instance as an argument
messagesController.setIOInstance(io, getUser);

io.on("connection", (socket) => {
  console.log("socket connected");
  socket.on("addUser", (userId) => {
    console.log("User connected:", {
      userId: userId,
      socketId: socket.id,
    });
    // Check if the user is already online
    if (!onlineUsers.some((user) => user.id === userId)) {
      onlineUsers.push({ id: userId });

      // Update user status to "online" in the map
      console.log("online users", onlineUsers);

      // Emit the updated online users list to all clients
      socket.broadcast.emit("updateOnlineUsers", onlineUsers);
    }

    addUser(userId, socket.id);
    // Map the socket to the user
    socketToUser.set(socket.id, userId);
  });

  socket.on(
    "sendMessage",
    async ({ conversationId: chatId, senderId, receiverId, text }) => {
      console.log("message ", senderId, receiverId, chatId, text);
      const user = getUser(receiverId);
      console.log("User:", user);
      if (user) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
        console.log("getMessage event fired");
        const newMessage = new isMessageSaved({
          conversationId: chatId,
          userId: receiverId,
          sender: senderId,
          text: text,
        });
        const savedMessage = await newMessage.save();
      } else {
        const offlineMessages = await messagesController.storeOfflineMessage(
          chatId,
          receiverId,
          senderId,
          text
        );
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected");
    const userId = socketToUser.get(socket.id);

    if (!Array.from(socketToUser.values()).includes(userId)) {
      // Remove the user from onlineUsers only if they have no active sockets
      onlineUsers = onlineUsers.filter((user) => user.id !== userId);
      console.log("online users", onlineUsers);
      // Emit the updated online users list to all clients
      socket.broadcast.emit("updateOnlineUsers", onlineUsers);
    }
    removeUser(socket.id);
    io.emit("getUsers", usersArray);
  });
});

app.get("/", (req, res) => {
  res.send("Chat started");
});
