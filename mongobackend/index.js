import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import securityGuardRoutes from "./routes/securityGuardRoutes.js";
import gadgetRoutes from "./routes/gadgetRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Import config
import "./config/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route handlers
app.use(authRoutes);
app.use(userRoutes);
app.use(visitorRoutes);
app.use(meetingRoutes);
app.use(passwordResetRoutes);
app.use(securityGuardRoutes);
app.use(gadgetRoutes);
app.use(notificationRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("🚀 MongoDB + Mongoose + Express Server is running!");
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
