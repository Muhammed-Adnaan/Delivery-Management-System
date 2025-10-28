const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Driver = require("../models/driver");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
	const { username, email, password, role, phone } = req.body;
	if (!username || !email || !password || !role) {
		return res.status(400).json({ error: "All fields are required." });
	}
	try {
		const existingUser = await User.findOne({ where: { username } });
		const existingEmail = await User.findOne({ where: { email } });
		if (existingUser) {
			return res.status(409).json({ error: "Username already exists." });
		}
		if (existingEmail) {
			return res.status(409).json({ error: "Email already exists." });
		}
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await User.create({
			username,
			email,
			password: hashedPassword,
			role,
		});
		if (role === "driver") {
			await Driver.create({
				name: username,
				email,
				oauth_provider: "local",
				oauth_id: username,
				phone: phone || null,
			});
			// Driver registered successfully.
		}
		return res.status(201).json({ message: "User registered successfully." });
	} catch (err) {
		// Server error
		return res.status(500).json({ error: "Server error." });
	}
});

// Login route
router.post("/login", async (req, res) => {
	const { username, email, password } = req.body;
	if ((!username && !email) || !password) {
		return res
			.status(400)
			.json({ error: "Username or email and password are required." });
	}
	try {
		const user = await User.findOne({
			where: username ? { username } : { email },
		});
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials." });
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ error: "Invalid credentials." });
		}
		return res.status(200).json({
			message: "Login successful.",
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		// Server error
		return res.status(500).json({ error: "Server error." });
	}
});

module.exports = router;
