// server/index.ts
import express from 'express';
import session from 'express-session';
import MemoryStoreImport from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { DiscordBot } from './services/discord-bot.js';
import { router } from './routes.js';

const MemoryStore = MemoryStoreImport(session);

const app = express();
app.use(express.json());

// --- Session setup ---
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: true
  })
);

// --- Passport setup ---
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === 'admin' && password === 'admin') return done(null, { id: 1, username });
    return done(null, false);
  })
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: number, done) => done(null, { id, username: 'admin' }));

// --- Routes ---
app.use('/api', router);

app.get('/', (_req, res) => res.send('RSRP Bot Backend Running'));

// --- Start Express server ---
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Discord bot ---
const discordBot = new DiscordBot();
discordBot.initialize().catch(err => console.error('Discord bot failed to initialize:', err));
