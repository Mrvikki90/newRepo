module.exports = (app) => {
  const Message = require("../controllers/messages.controller");

  var router = require("express").Router();

  router.post("/", Message.addMessages);

  router.get("/:conversationId", Message.getMessages);

  app.use("/messages", router);
};
