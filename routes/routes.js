module.exports = (app) => {
  const tutorials = require("../controllers/controllers");
  const Images = require("../middleware/upload-image");

  var router = require("express").Router();
  router.post(
    "/post",
    Images.imageUpload.single("profileImg"),
    tutorials.create
  );
  router.get("/getone", tutorials.findOne);
  router.post("/login", tutorials.Login);
  router.get("/allUsers", tutorials.findAll);
  router.post("/forget-password-mail", tutorials.forgetPasswordMail);
  router.post("/reset-password", tutorials.ResetPassword);

  app.use("/api", router);
};
