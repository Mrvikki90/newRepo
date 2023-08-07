module.exports = (app) => {
  const Groups = require("../controllers/groups.controller");

  var router = require("express").Router();

  router.post("/", Groups.addGroup);

  router.get("/groups", Groups.getGroup);

  router.get("/groups/:id", Groups.getGroupById);

  app.use("/groups", router);
};
