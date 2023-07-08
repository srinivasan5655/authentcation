const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const User = require("../models/user");
require("dotenv").config()

const SALT_ROUNDS = 12;


const checkError = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
};

exports.signup = async (req, res, next) => {
  try {
    checkError(req);
    const email = req.body.email;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      email: email,
      password: hashedPw,
    });
    const result = await user.save();
    res.status(201).json({ message: "user created!", userId: result._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    checkError(req);
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("No user's found with this email");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong Password");
      error.statusCode = 401;
      throw error;
    }
    // creating login token using jwt
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.TOKEN_HASH_KEY,
      { expiresIn: "15m" }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

 
  const resetToken = jwt.sign(                 // Generate a reset token
    {
      email: user.email,
      userId: user._id.toString(),
    },
    "resettokenkey",
    { expiresIn: "15m" }
  );

  // Send the reset token to the user's email address (using nodemailer) 
  const transporter = nodemailer.createTransport({
    service: 'Gmail',    // works only for gmail
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASS,  // user application password for gmail if you use 2-factor authentication
      
    },
  });
  
  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://your-app-url/reset-password/${resetToken}
    Reset token: ${resetToken}
    `,
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      next(error);
      return res.status(500).json({ error: 'Failed to send email' });
      
    }

    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Password reset email sent' });
  });
};

exports.resetPassword = async (req, res) => {
  checkError(req);
  const { resetToken } = req.body;
  const { newPassword } = req.body;
  if (!resetToken) {
    return res.status(404).json({ error: 'Reset token Required' });
  }
  try {
    decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_HASH_KEY);
  } catch (err) {
    err.statusCode = 500;
    err.message = "Invalid or expired reset token ";
    res.status(401).json({ error: err.message });
    //throw err;
  }
  // Hash the new password before saving it (using bcrypt)
  bcrypt.hash(newPassword, SALT_ROUNDS , async (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }
    const user = await User.findOne({ email: decodedToken.email });
    user.password = hash; // Update the user's password
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  });
}