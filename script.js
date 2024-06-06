const game = {
	dicecount: 2,
	turn: -1,
	towin: 100,
	acc: 0,
};

const players = [
	{
		name: 'cabbagefaulty',
		score: 0,
	},
	{
		name: 'McLovin',
		score: 0,
	},
	{
		name: 'Pedro',
		score: 0,
	},
];

function createButton(text, classes) {
	const button = document.createElement('button');
	button.textContent = text;
	button.className = classes;
	return button;
}

function drawDie(number) {
	const matrix = {
		0: [],
		1: [4],
		2: [2, 6],
		3: [2, 4, 6],
		4: [0, 2, 6, 8],
		5: [0, 2, 4, 6, 8],
		6: [0, 2, 3, 5, 6, 8],
	};

	const die = document.createElement('div');
	die.className = 'die';

	for (let i = 0; i < 9; i++) {
		const div = document.createElement('div');
		if (matrix[number].includes(i)) {
			div.className = 'circle';
		}
		die.appendChild(div);
	}
	return die;
}

function throwDice(dicecount) {
	const dice = document.querySelector('.dice');
	const out = [];
	dice.innerHTML = '';

	for (let i = 0; i < dicecount; i++) {
		const throwNumber = Math.floor(Math.random() * 6) + 1;

		// 1. Calculate a number between 1-6
		// 2. append score to output list
		// 3. Call drawDie function which returns an element matching the thrown die
		// 4. Append the die to DOM
		out.push(throwNumber);
		dice.appendChild(drawDie(throwNumber));
	}
	return calcScore(out);
}

function calcScore(dice) {
	if (dice.includes(1)) {
		// If either of the dice are number 1
		return 0;
	} else if (dice[0] === dice[1]) {
		// if both dice are same, multiply sum by 2
		return (dice[0] + dice[1]) * 2;
	} else if (dice.length >= 2) {
		// return sum of 2 dice
		return dice[0] + dice[1];
	} else {
		// return sum of die
		return dice[0];
	}
}

function nextTurn() {
	const diceElement = document.querySelector('.dice');
	diceElement.classList.add('transparent');

	if (game.acc > 0) {
		players[game.turn].score += game.acc;
		game.acc = 0;
		listPlayers();
	}

	if (game.turn >= players.length - 1) {
		game.turn = 0;
	} else {
		game.turn++;
	}
	displayPlayer(players[game.turn].name);
}

async function onRoll() {
	const diceElement = document.querySelector('.dice');
	// 1. Add listener for shake animation to end
	// 2. Add shake class to dice
	diceElement.childNodes.forEach((i) => i.classList.add('shake'));
	diceElement.addEventListener('animationend', onShakeEnd);

	function onShakeEnd() {
		//TODO: make button not clickable for a while
		// 1. Remove listener
		// 2. Remove Transparent
		// 3. Calculate score
		diceElement.removeEventListener('animationend', onShakeEnd);
		diceElement.classList.remove('transparent');
		const thrown = throwDice(game.dicecount);
		thrown > 0 ? (game.acc += thrown) : nextTurn();
		console.log(game.acc);
	}
}

async function onClick(e) {
	const cName = e.target.className;
	if (cName === 'roll') {
		onRoll();
	} else if (cName === 'hold') {
		nextTurn();
	} else if (cName === 'start') {
		onGameStart();
	} else if (cName === 'player-add') {
		onPlayerAdd();
	}
}

//TODO:
function onPlayerAdd() {
	// 1. Get input field value
	// 2. Add player to the players object, key: name, value: score
	const inputValue = document.querySelector('input');

	if (playerName) {
		players.push({ name: input.value, score: 0 });
		input.value = '';
	}
}

function displayPlayer(name) {
	const parent = document.querySelector('.middle');
	const h1 = document.createElement('h1');
	const div = document.createElement('div');

	// Remove previous players name if it exists.
	if (document.querySelector('.slidein')) {
		document.querySelector('.slidein').remove();
	}
	h1.textContent = name;
	div.className = 'slidein';
	div.append(h1);
	parent.append(div);
}

function listPlayers() {
	const parent = document.querySelector('.player-list');
	const ul = document.createElement('ul');
	parent.innerHTML = '';

	for (let p of players) {
		const li = document.createElement('li');
		const text = document.createTextNode(`${p.name}: ${p.score}`);
		li.appendChild(text);
		ul.appendChild(li);
	}
	parent.appendChild(ul);
}

function onGameStart() {
	// 1. List Players
	// 2. Clear btn-container
	// 3. Roll dice but don't count it yet
	// 4. Create a button for rolling and add it to DOM
	// 5. Start the turn from the first player
	// TODO: Randomize player order
	const btns = document.querySelector('.btn-container');

	listPlayers();
	btns.innerHTML = '';
	throwDice(game.dicecount);
	btns.appendChild(createButton('Roll The Dice', 'roll'));
	btns.appendChild(createButton('Hold', 'hold'));
	nextTurn();
}

function startScreen() {
	// Show the start screen
	const inputBox = document.createElement('input');
	inputBox.type = 'text';
	document.querySelector('.btn-container').appendChild(inputBox);
	document.querySelector('.btn-container').appendChild(createButton('Add Player', 'player-add'));
	document.querySelector('.dice').appendChild(createButton('Start Game', 'start'));
}

startScreen();
addEventListener('click', onClick);
