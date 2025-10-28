const express = require("express");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const User = require("../models/user");
const Driver = require("../models/driver");

const router = express.Router();

router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.json({ error: "Username and password are required" });
	}

	try {
		const user = await User.findOne({
			where: {
				[Op.or]: [{ username }, { email: username }],
			},
		});

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Get driver info if user is a driver
		let driverInfo = null;
		if (user.role === "driver") {
			const driver = await Driver.findOne({ where: { name: user.username } });
			if (driver) {
				driverInfo = {
					id: driver.id,
					name: driver.name,
				};
			}
		}

		res.json({
			success: true,
			message: "Login successful.",
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				role: user.role,
			},
			driver: driverInfo,
		});
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Login failed" });
	}
});

module.exports = router;
