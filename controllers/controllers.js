const db = require("../database/database");
const User = db.user;
const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Busboy = require("busboy");

// Create and Save a new Tutorial
exports.create = (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  Bcrypt.hash(req.body.password, 10, function (err, hash) {
    const url = req.protocol + "://" + req.get("host");
    // Create a Tutorial
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      profileImg: req.body.filename,
    });

    console.log("user", user);
    user
      .save(user)
      .then((data) => {
        res.send({ data: data, message: "user created successfully." });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the user.",
        });
      });
  });
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  User.find()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

exports.findOne = async (req, res) => {
  const userId = req.query.userId;
  const userName = req.query.name;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ name: userName });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Find a single Tutorial with an id
exports.Login = async function (req, res) {
  try {
    const { email, password } = req.body.data;

    if (!(email && password)) {
      return res.status(400).send("All input required");
    }
    const user = await User.findOne({ email });

    if (user && (await Bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ user_id: user._id, email }, "SOCKETSERVER", {
        expiresIn: "2h",
      });

      user.token = token;

      return res
        .status(200)
        .send({ token: token, user: user, message: "login succesfully" });
    }
    res.status(401).send({ message: "Invalid credentials" });
  } catch (err) {
    console.log(err);
  }
};
