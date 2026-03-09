# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MOOD (METU Online Oyun Desteği) is a Kahoot-like quiz game platform. Teachers create quizzes and host live game sessions; players join via a PIN code and answer questions in real-time.

## Commands

```bash
# Install dependencies
npm install

# Initialize SQLite database (development)
NODE_ENV=development node --trace-warnings db/initdb.js

# Seed database
NODE_ENV=development npx sequelize db:seed:all

# Run development server (with auto-reload)
NODE_ENV=development npm run dev

# Run production server
npm start

# Lint
npx eslint .
```

The app runs on `http://localhost:3000`. Register at `/register`, login at `/login`, players join at `/`.

## Architecture

**Runtime:** Node.js 14, Express, EJS templates, Socket.io for real-time game communication.

**Entry point:** `app.js` — sets up Express middleware, HTTP routes, and all Socket.io event handlers for the game lifecycle (host-join, player-join, playerAnswer, nextQuestion, scoring, etc.). Game state (active games and players) is held in-memory via `LiveGames` and `Players` classes.

**Database:** Sequelize ORM with SQLite for development, PostgreSQL for production. Config in `db/config/config.json`, Sequelize CLI paths configured in `.sequelizerc` (models, seeders, migrations all under `db/`).

**Key layers:**
- `routes/` — Express routers: `user.routes.js` (auth, quiz CRUD, home), `host.routes.js` (lobby, gameblock, gameover views), `player.routes.js` (player join/game views). Auth via Passport local strategy in `routes/auth.js`, guard middleware in `routes/isAuth.js`.
- `utils/queries.js` — `Query` class with static methods for all Sequelize database operations (quiz/question/answer CRUD, game scoring). This is the data access layer.
- `utils/liveGames.js` / `utils/players.js` — In-memory stores for active game sessions and connected players during Socket.io gameplay.
- `db/models/` — Sequelize models: User, Quiz, Question, Answer, QuestionType, TimeLimit, LobbyMusic, Game, Player, PlayerQuestion, PlayerAnswer. Auto-loaded via `db/models/index.js`.
- `views/` — EJS templates organized by role: `views/host/` (teacher game screens), `views/player/` (player game screens), `views/user/` (auth, quiz management), `views/partials/` (shared components).
- `public/javascripts/` — Client-side JS: `zocket-host.js`/`zocket-host2.js` (host Socket.io client), `zocket-player.js` (player Socket.io client), `lobby.js`/`lobbyApp.js` (lobby UI).

**Socket.io game flow:** Host creates game → gets PIN → players join with PIN → host starts game → questions are sent via socket events → players answer → scores computed → next question or game over with leaderboard.

**`zenes/` directory** contains experimental/scratch files, not part of the running application.
