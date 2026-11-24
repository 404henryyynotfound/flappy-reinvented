# Contributing to Flappy Bird Reinvented

Thank you for your interest in helping build **Flappy Bird Reinvented**!

## How Access Works (Application-Only Open Source)

This is a **closed/private open-source project** maintained by Henry Green (Xelotics Games). While the source code is licensed under the MIT License for approved collaborators, direct push access is restricted to accepted contributors to protect game integrity, player accounts, and the global leaderboard.

## How to Apply for Contribution Permissions

If you would like to contribute code, gameplay mechanics, art, audio, or bug fixes, please email **greenhenry441@gmail.com** with the following details:

* **Your Name**
* **Your GitHub Username**
* **Why You Want to Help** (along with any ideas or skills you'd like to bring to the project, such as HTML5 Canvas, JavaScript, Supabase, or game design)

Once your application is reviewed and approved, you will receive a GitHub repository invite with contributor permissions.

## Contribution Guidelines (For Approved Contributors)

Before submitting changes, please keep the following in mind:

1. **Follow the Code of Conduct**: All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
2. **Keep the Tech Stack Clean**: This project uses vanilla **HTML5 Canvas, HTML/CSS, and JavaScript** with **Supabase**—avoid adding heavy external frameworks unless discussed first.
3. **Respect the Project Structure**:
   * `.github/workflows/` – Automated deployment configuration
   * `index.html` – Main game page, styling, loading screen, main menu, and modals
   * `game.js` – Core game loop, physics, collision detection, audio, and mechanics
   * `auth.js` – `AuthManager` class for user authentication (Sign Up, Log In, Log Out)
   * `database.js` – `GameDatabase` class for cloud saves and Top 10 global leaderboard
   * `supabase-config.js` – Supabase client initialization and configuration
4. **Protect Credentials**: Never expose private service keys or sensitive database credentials in commits.
5. **Submit Clear Pull Requests**: Create a new branch for your feature or fix and clearly describe your changes when opening a pull request.

## Bug Reports & Feature Ideas

Even before joining as a code contributor, feel free to reach out at **greenhenry441@gmail.com** with bug reports, balance feedback, or ideas for new power-ups and skins!
