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
    secret: "supersecret",
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

app.listen(3000, () => console.log("Server running on port 3000"));

// --- Discord bot setup ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);

// --- WebSocket example ---
const wss = new ws.Server({ port: 8080 });
wss.on("connection", socket => {
  console.log("WebSocket client connected");
  socket.on("message", message => console.log(`Received: ${message}`));
  socket.send("Hello from backend!");
});
