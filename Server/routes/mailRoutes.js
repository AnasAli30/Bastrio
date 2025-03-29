const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const sendVerificationEmail = require("../mailVerification/mailer");
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) return res.status(400).json({ message: "Email already exists" });

  const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

  const newUser = new User({ email, verificationToken });
  await newUser.save();

  await sendVerificationEmail(email, verificationToken);

  res.json({ message: "Verification email sent" });
});

// Email verification route
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
