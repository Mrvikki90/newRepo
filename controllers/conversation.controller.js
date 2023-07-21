const db = require("../database/database");
const Conversation = db.conversation;
const ChatTracking = db.ChatTracking;
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.getConversation = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    if (receiverId) {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      })
        .populate([
          {
            path: "messages",
            select: {},
          },
        ])
        .exec();

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
  if (!req.body.senderId && !req.body.receiverId) {
    return res.status(400).json({ message: "both id required" });
  }
  // Check if a conversation already exists between the two users
  const existingConversation = await Conversation.findOne({
    members: { $all: [req.body.senderId, req.body.receiverId] },
  });

  if (existingConversation) {
    // Conversation already exists, return the existing conversation
    return res.status(200).json(existingConversation);
  }

  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
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

    // Ensure that the requesting user is a member of the conversation
    // Assuming you pass the user ID in the request body as `req.body.userId`
    if (!conversation.members.includes(req.body.userId)) {
      return res.status(403).json({
        message: "You are not authorized to delete this conversation",
      });
    }

    // If the user is authorized, delete the conversation
    await conversation.remove();
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the conversation" });
  }
};
