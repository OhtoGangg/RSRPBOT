import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { DiscordBot } from "./services/discord-bot.js";

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
    if (username === "admin" && password === "admin") return done(null, { id: 1, username });
    return done(null, false);
  })
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: number, done) => done(null, { id, username: "admin" }));

app.get("/", (req, res) => res.send("RSRP Bot Backend Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Discord bot init
const bot = new DiscordBot();
bot.initialize().catch(console.error);
