import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Client, GatewayIntentBits } from "discord.js";
import ws from "ws";

// --- Express setup ---
const app = express();
app.use(express.json());

const MemoryStoreSession = MemoryStore(session);

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStoreSession({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --- Passport authentication ---
passport.use(
  new LocalStrategy((username, password, done) => {
    // TODO: replace with real authentication
    if (username === "admin" && password === "admin") return done(null, { id: 1, username });
    return done(null, false);
  })
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: number, done) => done(null, { id, username: "admin" }));

app.get("/", (req, res) => res.send("RSRP Bot Backend Running"));

// --- Start Express server ---
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Discord bot setup ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN environment variable not set!");
  process.exit(1);
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.login(token);

// --- WebSocket setup ---
const WSPORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;
const wss = new ws.Server({ port: WSPORT });

wss.on("connection", (socket) => {
  console.log("WebSocket client connected");

  socket.on("message", (message) => {
    console.log(`Received: ${message}`);
  });

  socket.send("Hello from backend!");
});

console.log(`WebSocket server running on port ${WSPORT}`);
