module.exports = (app) => {
  const Message = require("../controllers/messages.controller");

  var router = require("express").Router();

  router.post("/", Message.addMessages);

  router.get("/:conversationId", Message.getMessages);

  router.put("/mark-message-as-read/:messageId", Message.markUnreadMessages);

  app.use("/messages", router);
};
