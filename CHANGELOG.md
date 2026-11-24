# Changelog

All notable changes to **Flappy Bird Reinvented** (by Henry Green / Xelotics Games) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

---

## [1.0.1-beta] - Holiday Update

### Added
- **Christmas Seasonal Branding**: Added festive red and green UI styling with falling snowflakes across the game.
- **Holiday Audio**: Added *Jingle Bells* background music.
- **Festive Character Details**: Added Santa hats to birds during gameplay.

### Fixed
- **Global Leaderboard**: Fixed leaderboard tracking to accurately record and update live player scores without placeholder entries.

---

## [1.0.0-beta] - Initial Release

### Added
- **Core Arcade Gameplay**: HTML5 Canvas Flappy Bird physics, pipe obstacles, collision detection, and fever/power-up mechanics (`game.js`).
- **Game Modes**: Added **Endless Mode** and sequential **Campaign Levels** (`index.html`).
- **Shop & Upgrades**: Added **Robins** currency system along with unlockable **Skins**, **Perks**, and an in-game **Legend**.
- **Player Accounts**: Added Sign Up, Log In, Log Out, and Guest play support (`auth.js`).
- **Cloud Saves & Backend**: Integrated Supabase (`database.js`, `supabase-config.js`) for cloud-saved progress and the Top 10 Global Leaderboard.
- **Custom UI & Loading Screen**: Added custom loading screen (`Flappy is loading...`), main menu, and pop-up modals.
