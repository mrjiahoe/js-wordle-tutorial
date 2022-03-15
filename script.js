import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
console.log(rightGuessString);

function initBoard() {
	let board = document.getElementById("game-board");

	for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
		let row = document.createElement("div");
		row.className = "letter-row";

		for (let j = 0; j < 5; j++) {
			let box = document.createElement("div");
			box.className = "letter-box";
			row.appendChild(box);
		}

		board.appendChild(row);
	}
}

function shadeKeyBoard(letter, color) {
	// shadeKeyBoard receives the letter on the on-screen keyboard we want to shade and the color we want to shade it. thi is the algorithm:
	// 1. Find the key that matches the given letter
	// 2. If the key is already green, do nothing
	// 3. If the key is currently yellow, only allow it to become green
	// 4. Else, shade the key passed to the function
	for (const elem of document.getElementsByClassName("keyboard-button")) {
		if (elem.textContent === letter) {
			let oldColor = elem.style.backgroundColor;
			if (oldColor === "green") {
				return;
			}
			if (oldColor === "yellow" && color !== "green") {
				return;
			}

			elem.style.backgroundColor = color;
			break;
		}
	}
}

function insertLetter(pressedKey) {
	// insertLetter checks that there's still space in the guess for this letter, finds the appropriate row, and puts the letter in the box
	if (nextLetter === 5) {
		return;
	}
	pressedKey = pressedKey.toLowerCase();

	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let box = row.children[nextLetter];
	animateCSS(box, "pulse");
	box.textContent = pressedKey;
	box.classList.add("filled-box");
	currentGuess.push(pressedKey);
	nextLetter += 1;
}

function deleteLetter() {
	// deleteLetter gets the correct row, finds the last box and empties itm and then resets the nextLetter counter

	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let box = row.children[nextLetter - 1];
	box.textContent = "";
	box.classList.remove("filled-box");
	currentGuess.pop();
	nextLetter -= 1;
}

function checkGuess() {
	// checkGuess makes sure the guess is 5 letters and it is a valid list.
	// it checks each letter of the word and shades them and tells the user about the end of the game
	// checkGuess uses a simple algorithm to decide what color to shade each letter:
	// 1. checks if the letter is in the correct word
	// 2. if the letter is not in the word, shades letter grey
	// 3. if the letter is in the word, check if it's in the right position
	// 4. if the letter is in the right position, shades green
	// 5. else, shades yellow

	let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
	let guessString = "";
	let rightGuess = Array.from(rightGuessString);

	for (const val of currentGuess) {
		guessString += val;
	}

	if (guessString.length != 5) {
		toastr.error("Not enough letters!");
		return;
	}

	if (!WORDS.includes(guessString)) {
		toastr.error("Word not in list");
		return;
	}

	for (let i = 0; i < 5; i++) {
		let letterColor = "";
		let box = row.children[i];
		let letter = currentGuess[i];

		let letterPosition = rightGuess.indexOf(currentGuess[i]);
		// is letter in the correct guess
		if (letterPosition === -1) {
			letterColor = "grey";
		} else {
			// now, letter is definitely in word
			// if letter index and right guess index are the same
			// letter is in the right position
			if (currentGuess[i] === rightGuess[i]) {
				// shade green
				letterColor = "green";
			} else {
				// shade box yellow
				letterColor = "yellow";
			}

			rightGuess[letterPosition] = "#";
		}

		let delay = 250 * i;
		setTimeout(() => {
			//flip box
			animateCSS(box, "flipInX");
			//shade box
			box.style.backgroundColor = letterColor;
			shadeKeyBoard(letter, letterColor);
		}, delay);
	}

	if (guessString === rightGuessString) {
		toastr.success("You guessed right! Game over!");
		guessesRemaining = 0;
		return;
	} else {
		guessesRemaining -= 1;
		currentGuess = [];
		nextLetter = 0;

		if (guessesRemaining === 0) {
			toastr.error("You've run out of guesses! Game over!");
			toastr.info(`The right word was: "${rightGuessString}"`);
		}
	}
}

const animateCSS = (element, animation, prefix = "animate__") =>
	// Wr create a Promise and return it
	new Promise((resolve, reject) => {
		const animationName = `${prefix}${animation}`;
		// const node = document.querySelector(element);
		const node = element;
		node.style.setProperty("--animate-duration", "0.3s");

		node.classList.add(`${prefix}animate`, animationName);

		// When the animation ends, we clean the classes and resolve the Promise
		function handleAnimationEnd(event) {
			event.stopPropagation();
			node.classList.remove(`${prefix}animated`, animationName);
			resolve("Animation ended");
		}

		node.addEventListener("animationed", handleAnimationEnd, { once: true });
	});

document.addEventListener("keyup", (e) => {
	if (guessesRemaining === 0) {
		return;
	}

	let pressedKey = String(e.key);
	if (pressedKey === "Backspace" && nextLetter !== 0) {
		deleteLetter();
		return;
	}

	if (pressedKey === "Enter") {
		checkGuess();
		return;
	}

	let found = pressedKey.match(/[a-z]/gi);
	if (!found || found.length > 1) {
		return;
	} else {
		insertLetter(pressedKey);
	}
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
	// This function listens for a click on the keyboard container or any of its children (the buttons). If the clicked element was not a button, we exit the function. Else, we dispatch a key up event corresponding to the clicked key
	const target = e.target;

	if (!target.classList.contains("keyboard-button")) {
		return;
	}
	let key = target.textContent;

	if (key === "Del") {
		key = "Backspace";
	}

	document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();
