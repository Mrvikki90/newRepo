const db = require("../database/database");
const Message = db.message;
const Conversation = db.conversation;
require("dotenv").config();
const { getUser } = require("../index");

let ioInstance;
let getUserFunction;

exports.setIOInstance = (io, getUser) => {
  ioInstance = io;
  getUserFunction = getUser;
};

exports.addMessages = async (req, res) => {
  try {
    const newMessage = new Message({
      conversationId: req.body.conversationId,
      senderId: req.body.sender,
      text: req.body.text,
    });

    const savedMessage = await newMessage.save();
    return res
      .status(200)
      .json({ message: "message saved", data: savedMessage });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getOfflineMessages = async (userId) => {
  try {
    const offlineMessages = await Message.find({
      userId: userId,
      offlineMessaes: true,
    });
    return offlineMessages;
  } catch (err) {
    throw err;
  }
};

exports.storeOfflineMessage = async (chatId, receiverId, senderId, message) => {
  // Access the io instance using the global variable
  const newMessage = new Message({
    conversationId: chatId,
    userId: receiverId,
    sender: senderId,
    text: message,
    offlineMessaes: true,
  });

  try {
    await newMessage.save();
    return;
  } catch (err) {
    throw err;
  }
};

exports.clearOfflineMessages = async (userId) => {
  try {
    await Message.deleteMany({ userId: userId });
  } catch (err) {
    throw err;
  }
};

// Assuming you have already set up your Express app and WebSocket connections
exports.markUnreadMessages = async (req, res) => {
  try {
    const chatId = req.params.messageId;
    // Find the conversation by chatId
    const conversation = await Conversation.findById(chatId);

    // Check if the conversation exists
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Update all messages in the conversation to mark them as read and set offlineMessages to false
    await Message.updateMany(
      { conversationId: chatId, offlineMessaes: true },
      { $set: { offlineMessaes: false } }
    );

    res.json({ message: "All unread messages marked as read." });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark messages as read." });
  }
};
