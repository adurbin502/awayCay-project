const express = require("express");
const bcrypt = require("bcryptjs");

const {
  setTokenCookie,
  requireAuth,
} = require("../../utils/auth");
const { User } = require("../../db/models");
const { check } = require("express-validator");
const {
  handleValidationErrors,
} = require("../../utils/validation");

const router = express.Router();

const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage(
      "Please provide a username with at least 4 characters."
    ),
  check("username")
    .not()
    .isEmail()
    .withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First name is required."),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last name is required."),
  handleValidationErrors,
];

router.post("/", validateSignup, async (req, res, next) => {
  const { email, password, username, firstName, lastName } = req.body;

  // Check if email or username already exists
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }]
    }
  });

  if (existingUser) {
    const errors = {};
    if (existingUser.email === email) errors.email = "User with that email already exists";
    if (existingUser.username === username) errors.username = "User with that username already exists";

    const err = new Error("User already exists");
    err.status = 500;
    err.errors = errors;
    return next(err);
  }

  // Create new user if email and username are unique
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    email,
    username,
    firstName,
    lastName,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.status(201).json({
    user: safeUser,
  });
});


router.get("/current", requireAuth, async (req, res) => {
  const { user } = req;

  if (!user) {
    return res.status(404).json({ message: 'No user logged in' });
  }

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  return res.json({ user: safeUser });
});

module.exports = router;
