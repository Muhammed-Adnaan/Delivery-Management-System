const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const sequelize = require("./config/db");
const User = require("./models/user");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.set("trust proxy", 1);

// Rate Limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir);
}

const uploadRoutes = require("./routes/upload");
app.use("/api", uploadRoutes);

const clusteringRoutes = require("./routes/clustering");
app.use("/api", clusteringRoutes);

const batchRoutes = require("./routes/batch");
app.use("/api", batchRoutes);

const registerRoutes = require("./routes/register");
app.use("/user", registerRoutes);

const loginRoutes = require("./routes/login");
app.use("/user", loginRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const otpRoutes = require("./routes/otp");
app.use("/api", otpRoutes);

// Test database connection (without syncing)
sequelize
	// .sync({ force: true })
	.authenticate()
	.then(() => {
		// Database connection established successfully
	})
	.catch((err) => {
		// Database connection error
	});

// Health check route
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

// TODO: Mount routes from ./routes
// const routes = require('./routes');
// app.use('/api', routes);

app.listen(PORT, () => {
	// SiloDispatch backend running on port ${PORT}
	console.log(`${PORT}`);
	
});
