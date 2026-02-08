let selectedWord = "";
let maxMistakes = 6;
let currentMistakes = 0;
let wrongLetters = [];
const scrambledWordDisplay = document.getElementById("scrambled-word");
const inputContainer = document.getElementById("inputContainer");
const mistakesDisplay = document.getElementById("mistakes");
const wrongGuessesDisplay = document.getElementById("wrong");
const randomButton = document.getElementById("random");
const resetButton = document.getElementById("reset");

function shuffleWord(word) {
    const scrambled = word.split("");
    // backward loop -> prevents reshuffling already shuffled elements
    for (let i = scrambled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    return scrambled.join("");
}

let inputBoxes = [];

function createInputBoxes(length) {
    inputContainer.innerHTML = "";
    inputBoxes = [];
    for (let i = 0; i < length; i++) {
        const input = document.createElement("input");
        input.setAttribute("maxlength", 1);
        input.addEventListener("input", handleLetterInput);
        inputBoxes.push(input);
        inputContainer.appendChild(input);
    }
}
function startNewGame() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    console.log("Selected word:", selectedWord); // for debugging
    const scrambled = shuffleWord(selectedWord);
    scrambledWordDisplay.textContent = scrambled;
    createInputBoxes(selectedWord.length);
    currentMistakes = 0;
    wrongLetters = [];
    mistakesDisplay.textContent = currentMistakes;
    wrongGuessesDisplay.textContent = "";
}

function handleLetterInput(event) {
    const inputBox = event.target;
    const index = Array.from(inputContainer.children).indexOf(inputBox);
    const letter = inputBox.value.toLowerCase();
    const inputBoxes = Array.from(inputContainer.children);

    if (!/^[a-z]$/.test(letter) || letter === "") {
        inputBox.value = "";
        return;
    }

    if (letter === selectedWord[index]) {
        inputBox.style.borderColor = "green";
        inputBox.style.boxShadow = "0 0 8px green";

        const nextInput = inputBoxes[index + 1];
        if (nextInput) {
            nextInput.focus();
        }

    } else {
        inputBox.style.borderColor = "red";
        inputBox.style.boxShadow = "0 0 8px red";
        if (!wrongLetters.includes(letter)) {
            wrongLetters.push(letter);
            currentMistakes++;
        }
        mistakesDisplay.textContent = currentMistakes;
        wrongGuessesDisplay.textContent = wrongLetters.join(", ");
        if (currentMistakes >= maxMistakes) {
            alert("Game Over! The correct word was: " + selectedWord);
            startNewGame();
            return;
        }
    }

    let formedWord = "";
    for (let i = 0; i < inputBoxes.length; i++) {
        formedWord += inputBoxes[i].value.toLowerCase();
    }

    if (formedWord === selectedWord) {
        setTimeout(() => {
            alert("YAY!! You guessed the word.");
            startNewGame();
        }, 0);
    }
}


randomButton.addEventListener("click", startNewGame);
resetButton.addEventListener("click", startNewGame);
window.onload = startNewGame;