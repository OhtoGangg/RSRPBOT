import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { DiscordBot } from './services/discord-bot.js';
import WebSocket from 'ws';

// --- Express setup ---
const app = express();
app.use(express.json());

const MemoryStoreSession = MemoryStore(session);

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStoreSession({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    // TODO: Replace with real authentication
    if (username === 'admin' && password === 'admin') return done(null, { id: 1, username });
    return done(null, false);
  })
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: number, done) => done(null, { id, username: 'admin' }));

app.get('/', (req, res) => res.send('RSRP Bot Backend Running'));

// --- Start Express ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Discord Bot setup ---
const discordBot = new DiscordBot();
discordBot.initialize().catch(err => console.error('Discord bot failed to login:', err));

// --- WebSocket server ---
const WS_PORT = Number(process.env.WS_PORT) || 8080;
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (socket: WebSocket) => {
  console.log('WebSocket client connected');

  socket.on('message', (message: WebSocket.RawData) => {
    console.log(`Received: ${message.toString()}`);
  });

  socket.send('Hello from backend!');
});

console.log(`WebSocket server running on port ${WS_PORT}`);
