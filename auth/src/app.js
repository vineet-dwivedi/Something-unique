import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import morgan from "morgan";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import session from "express-session";

const app = express();

// CORS Middleware for frontend credentials
app.use((req, res, next) => {
  const origin = req.headers.origin || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); 

//Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}))

//Passport middleware for session handling
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/status/health", (req, res) => {
    res.status(200).json({ status: "UP" });
});

// Readiness check endpoint
app.get("/status/ready", (req, res) => {
    // Here you can add logic to check if the app is ready to serve requests
    res.status(200).json({ status: "READY" });
});

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: (process.env.GOOGLE_CLIENT_ID || '').trim(),
    clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // Here you can handle the user profile and create a JWT token
    return done(null, profile);
}));

// Serialize user into the sessions
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from the sessions
passport.deserializeUser((user, done) => {
    done(null, user);
});
 
export default app;
