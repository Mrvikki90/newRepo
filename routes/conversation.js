module.exports = (app) => {
  const Conversation = require("../controllers/conversation.controller");

  var router = require("express").Router();

  router.post("/", Conversation.createConversation);

  router.get("/:userId", Conversation.getConversation);

  router.get(
    "/find/:firstUserId/:secondUserId",
    Conversation.getConversationOfTwoUserId
  );

  router.post(
    "/update-last-selected-chat",
    Conversation.updateLastSelectedChat
  );

  // API endpoint to get the last selected chat for a user
  router.get(
    "/get-last-selected-chat/:userId",
    Conversation.getLastSelectedChat
  );

  // Delete a conversation
  router.delete("/delete/:conversationId", Conversation.deleteConversation);

  app.use("/conversation", router);
};
