
const Game = {
    mode: 'infinite', difficulty: 'medium', currentWordObj: null, scrambled: '', mistakes: 0, wrongLetters: [], score: 0, streak: 0, combo: 1.0, timer: 30, timerInterval: null, startTime: 0, maxMistakes: 6, history: [],
    powerups: { freeze: 3, vowel: 3, scissors: 3, life: 3 },
    user: { stats: { plays: 0, wins: 0, high: 0, dailyStreak: 0, lastDaily: null }, achievements: [], leaderboard: [] }
};

window.onload = () => { initStorage(); bindUI(); refreshDash(); updateUI(); };

function initStorage() {
    const saved = JSON.parse(localStorage.getItem('wordly_final_state'));
    if (saved) { Game.user = saved; Game.powerups = saved.powerups || Game.powerups; }
}

function saveStorage() { Game.user.powerups = Game.powerups; localStorage.setItem('wordly_final_state', JSON.stringify(Game.user)); }

function bindUI() {
    document.getElementById('btn-infinite-start').onclick = () => launch('infinite');
    document.getElementById('btn-daily-start').onclick = () => launch('daily');
    document.getElementById("settings-trigger").onclick = () => { document.getElementById("settings-difficulty").value = Game.difficulty; toggleModal("modal-settings"); };
    document.getElementById('btn-submit').onclick = validate;
    document.getElementById('btn-hint').onclick = giveHint;
    document.getElementById('btn-skip').onclick = () => endRound(false);
    document.getElementById('btn-menu').onclick = returnToMenu;
    document.getElementById('btn-apply-difficulty').onclick = applyDifficulty;
    document.getElementById('btn-reset-data').onclick = () => { if (confirm("Reset progress?")) { localStorage.clear(); location.reload(); } };

    document.getElementById('pu-freeze').onclick = () => applyPowerup('freeze');
    document.getElementById('pu-vowel').onclick = () => applyPowerup('vowel');
    document.getElementById('pu-scissors').onclick = () => applyPowerup('scissors');
    document.getElementById('pu-life').onclick = () => applyPowerup('life');

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('modal-container').style.display = 'none';
            const active = document.querySelector('.modal.active');
            if (active && (active.id.includes('victory') || active.id.includes('defeat'))) prepRound();
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        };
    });
}

function launch(m) {
    Game.mode = m; Game.difficulty = document.getElementById('select-difficulty').value;
    if (m === 'daily') {
        const today = new Date().toDateString();
        if (Game.user.stats.lastDaily === today) { notify("Daily session done!"); return; }
        const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        Game.currentWordObj = words[seed % words.length];
        Game.difficulty = Game.currentWordObj.difficulty;
    }
    document.getElementById('screen-start').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    prepRound();
}

function prepRound() {
    clearInterval(Game.timerInterval); Game.mistakes = 0; Game.maxMistakes = 6; Game.wrongLetters = [];
    if (Game.mode === 'infinite') {
        let pool = words.filter(w => w.difficulty === Game.difficulty);
        Game.currentWordObj = pool[Math.floor(Math.random() * pool.length)];
    }
    Game.scrambled = scramble(Game.currentWordObj.word);
    renderGrid();
    if (Game.difficulty === 'expert' || Game.mode === 'daily') {
        document.getElementById('game-timer').classList.remove('hidden');
        startTimer(Game.difficulty === 'expert' ? 25 : 45);
    } else document.getElementById('game-timer').classList.add('hidden');
    Game.startTime = Date.now();
    updateUI();
}

function scramble(w) {
    let a = w.split(''); for (let i = a.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }
    const res = a.join(''); return (res === w) ? scramble(w) : res;
}

function renderGrid() {
    document.getElementById('display-scrambled').textContent = Game.scrambled;
    document.getElementById('display-category').textContent = Game.currentWordObj.category;
    document.getElementById('mode-badge').textContent = Game.mode === 'daily' ? 'Daily' : Game.difficulty;
    const g = document.getElementById('input-grid'); g.innerHTML = '';
    for (let i = 0; i < Game.currentWordObj.word.length; i++) {
        const inp = document.createElement('input'); inp.maxLength = 1; inp.dataset.idx = i;
        inp.oninput = (e) => {
            let v = e.target.value.toLowerCase();
            if (v === Game.currentWordObj.word[i]) {
                e.target.className = 'correct';
                if (g.children[i + 1]) g.children[i + 1].focus();
            } else if (v !== "") {
                e.target.className = 'incorrect';
                if (!Game.wrongLetters.includes(v)) {
                    Game.wrongLetters.push(v); Game.mistakes++;
                    if (Game.mistakes >= Game.maxMistakes) endRound(false);
                }
            }
            updateUI();
            if (Array.from(g.children).every(i => i.value)) validate();
        };
        inp.onkeydown = (e) => { if (e.key === 'Backspace' && !e.target.value && i > 0) g.children[i - 1].focus(); };
        g.appendChild(inp);
    }
    setTimeout(() => g.firstChild.focus(), 150);
}

function validate() {
    const val = Array.from(document.getElementById('input-grid').children).map(i => i.value.toLowerCase()).join('');
    if (val === Game.currentWordObj.word) endRound(true);
    else { document.getElementById('input-grid').classList.add('shake'); setTimeout(() => document.getElementById('input-grid').classList.remove('shake'), 400); }
}

function applyPowerup(t) {
    if (Game.powerups[t] <= 0) return;
    const inps = document.getElementById('input-grid').children;
    let used = false;
    if (t === 'freeze' && Game.timerInterval) { Game.timer += 10; notify("⏱️ Distortion: +10s!"); used = true; }
    else if (t === 'vowel') {
        const vs = ['a', 'e', 'i', 'o', 'u'];
        for (let i = 0; i < Game.currentWordObj.word.length; i++) {
            if (vs.includes(Game.currentWordObj.word[i]) && !inps[i].value) { inps[i].value = Game.currentWordObj.word[i]; inps[i].className = 'correct'; used = true; break; }
        }
    }
    else if (t === 'scissors' && Game.mistakes > 0) { Game.mistakes = Math.max(0, Game.mistakes - 2); notify("✂️ Errors Clipped!"); used = true; }
    else if (t === 'life') { Game.maxMistakes++; notify("❤️ Life Extended!"); used = true; }
    if (used) { Game.powerups[t]--; saveStorage(); updateUI(); }
}

function giveHint() {
    const inps = document.getElementById('input-grid').children;
    for (let i = 0; i < Game.currentWordObj.word.length; i++) {
        if (inps[i].value.toLowerCase() !== Game.currentWordObj.word[i]) {
            inps[i].value = Game.currentWordObj.word[i]; inps[i].className = 'correct';
            Game.score = Math.max(0, Game.score - 50); updateUI();
            if (Array.from(inps).every((x, idx) => x.value === Game.currentWordObj.word[idx])) validate();
            return;
        }
    }
}

function endRound(won) {
    clearInterval(Game.timerInterval); const elapsed = Math.floor((Date.now() - Game.startTime) / 1000);
    let pts = 0;
    if (won) {
        pts = Math.floor((100 * { easy: 1, medium: 2, hard: 4, expert: 10 }[Game.difficulty] + (60 - elapsed)) * Game.combo);
        Game.score += pts; Game.streak++; Game.combo = Math.min(3.0, Game.combo + 0.1);
        if (Game.mode === 'daily') Game.user.stats.lastDaily = new Date().toDateString();
        Game.user.stats.wins++; checkAch(elapsed);
        document.getElementById('victory-word').textContent = Game.currentWordObj.word;
        document.getElementById('earned-points').textContent = pts;
        document.getElementById('solve-time').textContent = elapsed;
        showModal('modal-victory');
    } else { Game.streak = 0; Game.combo = 1.0; document.getElementById('defeat-word').textContent = Game.currentWordObj.word; showModal('modal-defeat'); }
    Game.user.stats.plays++; if (Game.score > Game.user.stats.high) Game.user.stats.high = Game.score;
    if (won) {
        updateLeaderboard(pts);
    } saveStorage(); refreshDash(); updateUI();
}

function startTimer(s) {
    Game.timer = s; document.getElementById('timer-val').textContent = Game.timer;
    Game.timerInterval = setInterval(() => { Game.timer--; document.getElementById('timer-val').textContent = Game.timer; if (Game.timer <= 0) endRound(false); }, 1000);
}

function updateUI() {
    document.getElementById('current-score').textContent = Game.score;
    document.getElementById('combo-multiplier').textContent = `x${Game.combo.toFixed(1)}`;
    document.getElementById('streak-ui').textContent = Game.streak;
    document.getElementById('mistake-count').textContent = Game.mistakes;
    document.getElementById('max-mistakes').textContent = Game.maxMistakes;
    document.getElementById('wrong-letters').textContent = Game.wrongLetters.join(', ');
    document.getElementById('qs-best').textContent = Game.user.stats.high;
    document.getElementById('qs-wins').textContent = Game.user.stats.wins;
    document.getElementById('qs-daily').textContent = Game.user.stats.dailyStreak || 0;
    document.getElementById('cnt-freeze').textContent = Game.powerups.freeze;
    document.getElementById('cnt-vowel').textContent = Game.powerups.vowel;
    document.getElementById('cnt-scissors').textContent = Game.powerups.scissors;
    document.getElementById('cnt-life').textContent = Game.powerups.life;
    Object.keys(Game.powerups).forEach(p => document.getElementById(`pu-${p}`).disabled = Game.powerups[p] <= 0);
}
function toggleModal(id) {

    document
        .querySelectorAll('.modal')
        .forEach(modal => {
            modal.classList.remove('active');
        });

    document
        .getElementById('modal-container')
        .style.display = 'flex';

    document
        .getElementById(id)
        .classList.add('active');
}
function showModal(id) {

    document
        .querySelectorAll('.modal')
        .forEach(modal => {
            modal.classList.remove('active');
        });

    document
        .getElementById('modal-container')
        .style.display = 'flex';

    document
        .getElementById(id)
        .classList.add('active');
}
function notify(t) { const b = document.getElementById('notification-bar'); b.textContent = t; b.classList.add('active'); setTimeout(() => b.classList.remove('active'), 3000); }
function unlockAchievement(name) {

    if (
        Game.user.achievements.includes(name)
    ) {
        return;
    }

    Game.user.achievements.push(name);

    notify(`🏆 ${name}`);

    saveStorage();

    refreshDash();
}

function checkAch(elapsed) {

    if (Game.user.stats.wins === 1) {
        unlockAchievement("First Resolve");
    }

    if (Game.streak === 5) {
        unlockAchievement("5 Win Streak");
    }

    if (Game.mistakes === 0) {
        unlockAchievement("Perfect Round");
    }

    if (elapsed <= 10) {
        unlockAchievement("Speed Solver");
    }

    if (Game.difficulty === 'expert') {
        unlockAchievement("Expert Victory");
    }

    if (Game.score >= 1000) {
        unlockAchievement("Score Master");
    }
}
function updateLeaderboard(pointsEarned) {

    if (pointsEarned <= 0) {
        return;
    }

    const latest =
        Game.user.leaderboard[0];

    if (
        latest &&
        latest.score === Game.score &&
        latest.diff === Game.difficulty
    ) {
        return;
    }

    Game.user.leaderboard.push({
        score: Game.score,
        diff: Game.difficulty,
        date: new Date().toLocaleDateString()
    });

    Game.user.leaderboard.sort(
        (a, b) => b.score - a.score
    );

    Game.user.leaderboard =
        Game.user.leaderboard.slice(0, 5);
}
function refreshDash() {
    const lb = Game.user.leaderboard || [];
    document.getElementById('list-leaderboard').innerHTML = lb.map(i => `<div class="dl-item"><span>${i.score}</span><small>${i.date}</small></div>`).join('') || 'None';
    const ach = Game.user.achievements || [];
    document.getElementById('list-achievements').innerHTML = ach.map(a => `<div class="dl-item"><span>🏆 ${a}</span></div>`).join('') || 'None';
}
function closeModals() {

    document.getElementById(
        'modal-container'
    ).style.display = 'none';

    document
        .querySelectorAll('.modal')
        .forEach(modal => {
            modal.classList.remove('active');
        });
}

function returnToMenu() {

    clearInterval(Game.timerInterval);

    closeModals();

    document
        .getElementById('screen-game')
        .classList.remove('active');

    document
        .getElementById('screen-start')
        .classList.add('active');
}

function applyDifficulty() {

    const newDifficulty =
        document.getElementById(
            'settings-difficulty'
        ).value;

    Game.difficulty = newDifficulty;
    closeModals();
    prepRound();
    notify(
        `Difficulty changed to ${newDifficulty}`
    );
}