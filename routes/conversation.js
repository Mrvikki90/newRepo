module.exports = (app) => {
  const Conversation = require("../controllers/conversation.controller");

  var router = require("express").Router();

  router.post("/", Conversation.createConversation);

  router.get("/:userId", Conversation.getConversation);

  router.get(
    "/find/:firstUserId/:secondUserId",
    Conversation.getConversationOfTwoUserId
  );

  app.use("/conversation", router);
};
