# Wordly

Wordly is a browser-based word puzzle game built using HTML, CSS, and vanilla JavaScript. The idea started as a simple scrambled word guessing game, but I gradually expanded it by adding adaptive difficulty, scoring systems, powerups, achievements, daily challenges, and persistent progression features.

The main goal of this project was to keep the core gameplay simple while making the internal logic and overall user experience feel polished and engaging.

---

## Gameplay

Players are given a scrambled word and must reconstruct it one letter at a time. Different difficulty levels change the complexity of the words and gameplay pressure.

The game currently includes:

- Easy, Medium, Hard, and Expert difficulty modes
- Daily Challenge mode
- Timer-based expert gameplay
- Streak and combo systems
- Dynamic score calculation
- Persistent leaderboard
- Achievement tracking
- Hint and powerup systems
- Responsive UI for desktop and mobile

---

## Features

### Adaptive Difficulty
Words are categorized by difficulty and selected dynamically during gameplay. Higher difficulties include longer and more complex words, while expert mode introduces time pressure.

### Smart Hint System
Hints and powerups are designed to help strategically instead of giving away answers instantly.

Current powerups include:
- Freeze Timer
- Reveal Vowel
- Remove Mistakes
- Extra Life

### Scoring System
The score system considers:
- difficulty level
- solve speed
- streaks
- combo multiplier
- mistakes made
- hints used

### Achievements & Progression
The game tracks player progress using localStorage, including:
- achievements
- high scores
- streaks
- leaderboard entries
- daily challenge completion

### Responsive Design
The interface is designed to work across desktop and mobile devices while maintaining the same visual style and gameplay experience.

---

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage API

---

## What I Focused On

While building this project, I mainly focused on:
- clean game-state management
- responsive UI behavior
- replayability
- balancing gameplay systems
- reducing repetitive gameplay
- improving overall polish without overcomplicating the project

---

## Folder Structure

```bash
Wordly/
│
├── index.html
├── styles.css
├── script.js
├── words.js
└── README.md
```

---

## Future Improvements

Some features I would like to add later:
- online multiplayer challenges
- backend-based global leaderboard
- sound system and music controls
- user profiles
- additional word packs and themes

---

## Author

Developed by Kundana.
