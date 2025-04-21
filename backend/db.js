//db.js
const mongoose = require("mongoose");

module.exports = () => {
	require("dotenv").config(); // Ensure this line exists in case it's used standalone

	const connectionParams = {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	};

	try {
		mongoose.connect(process.env.MONGO_URI, connectionParams); // 🔧 FIXED HERE
		console.log("✅ Connected to database successfully");
	} catch (error) {
		console.error("❌ Could not connect to database:", error);
	}
};