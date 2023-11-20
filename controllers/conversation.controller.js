const db = require("../database/database");
const Conversation = db.conversation;
const ChatTracking = db.ChatTracking;
const Message = db.message;
const User = db.user;

const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.getConversation = async (req, res) => {
  console.log("getConversation api called", req.params.id);

  try {
    const receiverId = req.params.receiverId;
    if (receiverId) {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      });

      // console.log("conversation", conversation);

      res.status(200).json(conversation);
    } else {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      });
      res.status(200).json(conversation);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getConversationOfTwoUserId = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.createConversation = async (req, res) => {
  try {
    if (!req.body.senderId && !req.body.receiverId) {
      return res.status(400).json({ message: "both id required" });
    }
    // Check if a conversation already exists between the two users
    const existingConversation = await Conversation.findOne({
      members: { $all: [req.body.senderId, req.body.receiverId] },
    });

    if (existingConversation) {
      // Conversation already exists, return the existing conversation
      //fetch user
      let filteredMembers = existingConversation.members.filter(
        (item) => item != req.body.senderId
      );

      let receiverUserId =
        filteredMembers.length > 0 ? filteredMembers[0] : null;

      const receiverUser = await User.findById(receiverUserId);

      res.status(200).json({
        status: 1,
        data: {
          conversation: existingConversation,
          user: receiverUser,
        },
      });
    } else {
      const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
      });

      const savedConversation = await newConversation.save();

      //fetch user

      let filteredMembers = savedConversation.members.filter(
        (item) => item != req.body.senderId
      );

      let receiverUserId =
        filteredMembers.length > 0 ? filteredMembers[0] : null;

      const receiverUser = await User.findById(receiverUserId);

      res.status(200).json({
        status: 0,
        data: {
          conversation: savedConversation,
          user: receiverUser,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ status: 500, data: err });
  }
};

exports.updateLastSelectedChat = async (req, res) => {
  const { userId, chatId } = req.body;

  try {
    // Find or create the chat tracking record for the user
    let chatTracking = await ChatTracking.findOne({ user: userId });
    if (!chatTracking) {
      chatTracking = new ChatTracking({ user: userId });
    }

    // Update the last selected chat ID
    chatTracking.lastSelectedChat = chatId;
    await chatTracking.save();

    res
      .status(200)
      .json({ message: "Last selected chat updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// API endpoint to get the last selected chat for a user
exports.getLastSelectedChat = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the chat tracking record for the user
    const chatTracking = await ChatTracking.findOne({ user: userId }).populate(
      "lastSelectedChat"
    );
    if (!chatTracking) {
      return res
        .status(404)
        .json({ message: "Chat tracking not found for this user." });
    }

    res.status(200).json(chatTracking.lastSelectedChat);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// Delete a conversation
// Assuming you already have a route for deleting a conversation

exports.deleteConversation = async (req, res) => {
  const conversationId = req.params.conversationId;

  try {
    // Fetch the conversation from the database
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // If the user is authorized, delete the conversation
    await conversation.remove();

    // Delete all messages associated with the conversation from the messages table
    await Message.deleteMany({ conversationId: conversationId });

    res
      .status(200)
      .json({ message: "Conversation deleted successfully", status: 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while deleting the conversation",
      error: err.message,
      status: 0,
    });
  }
};
