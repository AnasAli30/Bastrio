const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const sendVerificationEmail = require("../mailVerification/mailer");
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  console.log("called")
  const { email ,address} = req.body;
  const existingUser = await User.findOne({ email });
console.log(email,existingUser)
  if (existingUser?.email == email && (existingUser?.isVerified)) return res.status(400).json({ message: "Email already exists" });

  const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });


  const newUser = await User.findOneAndUpdate({address} , {email:email , isVerified:false})
  await newUser.save();

  await sendVerificationEmail(email, verificationToken);

  res.json({ status:200, message: "Verification email sent" });
});

// Email verification route
router.post("/verify-email", async (req, res) => {
  console.log("called")
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
