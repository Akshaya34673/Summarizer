// File: backend/routes/auth.js
const router = require("express").Router();
const  User = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");

router.post("/", async (req, res) => {
  try {
    console.log("Login request body:", req.body); // 🔍 Log incoming data

    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(401).send({ message: "Invalid Username or Password" });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).send({ message: "Invalid Username or Password" });

    const token = user.generateAuthToken();
    res.status(200).send({ data: token, message: "Logged in successfully" });
  } catch (error) {
    console.error("Login error:", error); // 🔥 Detailed backend log
    res.status(500).send({ message: "Internal Server Error" });
  }
});


const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label("Username"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;