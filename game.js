const words = ["javascript", "function", "variable", "object", "array", "promise", "closure", "callback","algorithm","loop","string","datastructure","debug","inquiry","journey","search","characters","skateboard","icecreame","hairbrush","shoelaces","overwhelm","trampoline","birthday","cockroach","hyena","archery","hiccup","apartment","president","computer"];
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
    let index = [];
    while (index.length < word.length) { 
        let i = Math.floor(Math.random() * word.length);
        if (!index.includes(i)) {
            index.push(i);
        }
    }

    let scrambled = "";
    for (let j = 0; j < index.length; j++) {
        scrambled += word[index[j]]; 
    }

    return scrambled;
}

let inputBoxs = [];
 
function createInputBoxes(length) {
    inputContainer.innerHTML = ""; 
    inputBoxs = [];
    for (let i = 0; i < length; i++) {
        const input = document.createElement("input");     
        input.setAttribute("maxlength", 1);                
        input.addEventListener("input", handleLetterInput);
        inputBoxs.push(input);                             
        inputContainer.appendChild(input);                 
    }
}
function startNewGame(){
    selectedWord = words[Math.floor(Math.random()*words.length)];
    const scrambled = shuffleWord(selectedWord);
    scrambledWordDisplay.textContent = scrambled;
    createInputBoxes(selectedWord.length);
    currentMistakes = 0;
    wrongLetters = [];
    mistakesDisplay.textContent = currentMistakes;
    wrongGuessesDisplay.textContent="";
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
        currentMistakes++;
        wrongLetters.push(letter);
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
        alert("YAY!! You guessed the word.");
        startNewGame();
    }
}


randomButton.addEventListener("click", startNewGame);
resetButton.addEventListener("click", startNewGame);
window.onload = startNewGame;