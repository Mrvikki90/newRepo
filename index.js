const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const messagesController = require("./controllers/messages.controller");
const db = require("./database/database");

const Conversation = db.conversation;

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

// Call the setIOInstance function and pass the io instance as an argument
messagesController.setIOInstance(io, getUser);

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    console.log("User connected:", {
      userId: userId,
      socketId: socket.id,
    });
    addUser(userId, socket.id);
  });

  socket.on(
    "sendMessage",
    async ({ conversationId: chatId, senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      console.log("User:", user);
      if (user) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
        });
        // Emit the updated unread count for the conversation to the receiver
        // const updatedConversation = await Conversation.findByIdAndUpdate(
        //   chatId,
        //   {
        //     $push: { messages: { sender: senderId, text } },
        //     $inc: { unreadMessages: 1 },
        //   },
        //   { new: true }
        // );

        // const conversation = await Conversation.findById(chatId);
        // if (conversation && receiverId !== senderId) {
        //   // If the conversation exists and the receiver is not the sender,
        //   // increment the unreadMessages count for the conversation only if it's not already incremented.
        //   if (!conversation.unreadMessages) {
        //     conversation.unreadMessages = 1;
        //   } else {
        //     conversation.unreadMessages += 1;
        //   }
        //   await conversation.save();
        // }

        // // Emit the updated unread count for the conversation to the receiver
        // io.to(user.socketId).emit("updateUnreadMessages", {
        //   chatId,
        //   unreadMessages: updatedConversation.unreadMessages,
        // });
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
    removeUser(socket.id);
    io.emit("getUsers", usersArray);
  });
});

app.get("/", (req, res) => {
  res.send("Chat started");
});
