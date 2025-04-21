// routes/users.js
const router = require("express").Router();
const User = require("../models/user"); // ✅ Import the User model directly
const bcrypt = require("bcrypt");

// Route: POST /api/users (Register new user)
router.post("/", async (req, res) => {
  try {
    // ✅ Validate incoming request data manually
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).send({ message: "All fields are required" });

    // ✅ Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(409)
        .send({ message: "User with given email already exists!" });

    // ✅ Hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT) || 10);
    const hashPassword = await bcrypt.hash(password, salt);

    // ✅ Create new user
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;