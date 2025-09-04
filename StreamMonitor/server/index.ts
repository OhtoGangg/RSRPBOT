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

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === "admin" && password === "admin") return done(null, { id: 1, username });
    return done(null, false);
  })
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: number, done) => done(null, { id, username: "admin" }));

app.get("/", (req, res) => res.send("RSRP Bot Backend Running"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// --- Discord bot setup ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

if (!process.env.DISCORD_TOKEN) {
  console.error("Please set DISCORD_TOKEN in environment variables");
} else {
  client.login(process.env.DISCORD_TOKEN);
}

// --- WebSocket example ---
const wssPort = Number(process.env.WS_PORT) || 8080;
const wss = new ws.Server({ port: wssPort });

wss.on("connection", socket => {
  console.log("WebSocket client connected");
  socket.on("message", message => console.log(`Received: ${message}`));
  socket.send("Hello from backend!");
});
