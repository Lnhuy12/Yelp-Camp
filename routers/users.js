const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");

const user = require("../controllers/users");
const passport = require("passport");

router
  .route("/register")
  .get(user.renderRegister)
  .post(catchAsync(user.register));

router
  .route("/login")
  .get(user.renderLogin)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    user.login
  );

router.get("/logout", user.logout);

module.exports = router;
