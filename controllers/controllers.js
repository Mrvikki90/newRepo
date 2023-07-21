const db = require("../database/database");
const User = db.user;
const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const CryptoJS = require("crypto-js");

// Create and Save a new Tutorial

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

exports.forgetPasswordMail = async (req, res) => {
  try {
    const generateToken = () => {
      const randomBytes = CryptoJS.lib.WordArray.random(32);
      const token = CryptoJS.enc.Hex.stringify(randomBytes);
      return token;
    };

    const resetToken = generateToken(); // Generate the reset token

    const encryptData = (data) => {
      const encryptedData = CryptoJS.AES.encrypt(
        data,
        "my_super_key"
      ).toString();
      return encryptedData;
    };

    const encryptedEmailData = encryptData(req.body.email + "|" + resetToken);

    const resetLink = `https://new-repo-client.vercel.app/reset-password?data=${encodeURIComponent(
      encryptedEmailData
    )}`;

    const msg = {
      to: req.body.email, // Change to your recipient
      from: process.env.SG_EMAIL, // Change to your verified sender
      subject: "Forget Password Link",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 5px; font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="text-align: center;">Forgot Password</h2>
          <p>Dear User,</p>
          <p>We received a request to reset your password. To proceed with the password reset, please click the button below:</p>
          <p style="text-align: center; margin-bottom: 20px;">
            <a style="display: inline-block; background-color: #4CAF50; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;" href="${resetLink}">Reset Password</a>
          </p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <div style="margin-top: 20px; text-align: center;">
            <p>Best regards,</p>
            <p>Your Application Team</p>
          </div>
        </div>
      `,
    };
    sgMail
      .send(msg)
      .then(() => {
        return res.status(200).send({
          code: "Success",
          message: "EMAIL SENT SUCCESSFULLY  ",
        });
      })
      .catch((error) => {
        return res.status(400).send({
          code: "Failed",
          message: error,
        });
      });
  } catch (error) {
    return res.status(404).status(error.message);
  }
};

exports.ResetPassword = async (req, res) => {
  const { email, newpass, confirmpass } = req.body;
  const user = await User.findOne({
    email: req.body.email,
  });

  // //Check Newpassword and ConfirmPassword
  if (req.body.newpass !== req.body.confirmpass) {
    res.status(500).send({
      message: "New password and Confirm Password do not match.",
    });
    return;
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { password: await Bcrypt.hash(newpass, 8) },
    },
    { new: true }
  );
  return res.status(200).send({
    message: "Password Updated.",
  });
};
