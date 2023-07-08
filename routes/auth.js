const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controller/auth");
const User = require("../models/user");


router.put(
  "/signup",
  // validating the inputs
  [                                                   
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("user already exist");
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error();
        }
        return true;
      }),
  ],
  authController.signup
);

router.post(
  "/login",
    // validating the inputs
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
  ],
  authController.login
);

router.post('/forgot-password',authController.forgotPassword);

router.post('/reset-password',
  // validating the inputs
[
  body(
    "newPassword",
    "Please enter a password with only numbers and text and at least 5 characters."
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error();
      }
      return true;
    }),
],
authController.resetPassword
);


module.exports = router;
