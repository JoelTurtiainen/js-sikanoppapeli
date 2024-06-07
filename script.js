const game = {
	dicecount: 0,
	turn: -1,
	towin: 100,
	acc: 0,
	doubles: 0,
};

const players = [];

function createButton(text, classes) {
	const button = document.createElement('button');
	button.textContent = text;
	button.className = classes;
	return button;
}

function drawDie(number, classes) {
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
	die.className = classes;

	for (let i = 0; i < 9; i++) {
		const div = document.createElement('div');
		if (matrix[number].includes(i)) {
			div.className = 'circle';
		}
		die.appendChild(div);
	}
	return die;
}

function randomNumber() {
	return Math.floor(Math.random() * 6) + 1;
}

function calcScore(dice) {
	if (dice[0] + dice[1] === 2) {
		// Both dice are 1
		return 25;
	} else if (dice.includes(1)) {
		// One die is 1
		return 0;
	} else if (dice[0] === dice[1]) {
		// Both are same
		game.doubles++; // UGLY
		return (dice[0] + dice[1]) * 2;
	} else if (dice.length >= 2) {
		// Dice are different
		return dice[0] + dice[1];
	} else {
		// When playing with 1 die
		return dice[0];
	}
}

function nextTurn() {
	const diceElement = document.querySelector('.dice');
	diceElement.classList.add('transparent');
	document.querySelector('.score-queue').textContent = '';
	game.doubles = 0;

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

function diceToDom(list, parent, classes = 'die') {
	list.forEach((i) => parent.appendChild(drawDie(i, classes)));
}

function toggleButtonVisibility() {
	const buttons = document.querySelector('.btn-container');
	buttons.classList.toggle('hidden');
}

function onRoll() {
	const diceElement = document.querySelector('.dice');
	// 1. Add .shake to dice which starts the animation & hide buttons for duration
	// 2. Add listener and continue after animation is ended
	toggleButtonVisibility();
	diceElement.childNodes.forEach((i) => i.classList.add('shake'));
	diceElement.addEventListener('animationend', onShakeEnd);
}

function insertPointsToQueue(points) {
	const queue = document.querySelector('.score-queue');
	const li = document.createElement('li');
	li.appendChild(document.createTextNode(points));
	queue.appendChild(li);
}

function onShakeEnd() {
	// 1. Remove listener, Transparent, textContent
	// 2. Add .roll back to the button
	toggleButtonVisibility();
	const diceElement = document.querySelector('.dice');

	diceElement.removeEventListener('animationend', onShakeEnd);
	diceElement.textContent = '';
	diceElement.classList.remove('transparent');

	const thrown = [];
	for (let i = 0; i < game.dicecount; i++) {
		thrown.push(randomNumber());
	}
	const points = calcScore(thrown);
	insertPointsToQueue(points);
	diceToDom(thrown, diceElement);
	if (points > 0 && game.doubles <= 3) {
		game.acc += points;
	} else {
		game.acc = 0;
		nextTurn();
	}
	console.log(`points: ${points} for throw ${thrown}`);
	console.log(`acc: ${game.acc} doubles: ${game.doubles}`);
}

function onClick(e) {
	const cName = e.target.className;
	if (cName === 'roll') {
		onRoll();
	} else if (cName === 'hold') {
		nextTurn();
	} else if (cName === 'start' && players.length >= 2 && game.dicecount > 0) {
		onGameStart();
	} else if (cName === 'player-add') {
		onPlayerAdd();
	}
}

//TODO:
function onPlayerAdd() {
	// 1. Get input field value
	// 2. Add player to the players object, key: name, value: score
	const inputBox = document.querySelector('input');
	if (inputBox.value) {
		players.push({ name: inputBox.value, score: 0 });
		inputBox.value = '';
	}
	listPlayers();
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
	const diceElement = document.querySelector('.dice');
	const btns = document.querySelector('.btn-container');

	listPlayers();
	btns.innerHTML = '';
	if (game.dicecount > 1) {
		diceToDom([0, 0], diceElement);
	} else {
		diceToDom([0], diceElement);
	}
	btns.appendChild(createButton('Roll The Dice', 'roll'));
	btns.appendChild(createButton('Hold', 'hold'));
	nextTurn();
}

function selectDiceAmount(e) {
	const siblings = e.currentTarget.parentElement.childNodes;

	siblings.forEach((i) => i.classList.remove('active'));

	e.currentTarget.classList.add('active');

	game.dicecount = 1 + Array.prototype.indexOf.call(siblings, e.currentTarget);
}

function startScreen() {
	// Show the start screen
	const inputBox = document.createElement('input');
	const btns = document.querySelector('.btn-container');
	const parentDiv = document.createElement('div');
	const h2 = document.createElement('h2');
	let ChildDiv;

	ChildDiv = document.createElement('div');
	h2.textContent = 'How many dice to play with';
	ChildDiv.className = 'float-container';
	ChildDiv.style.scale = 0.6;
	parentDiv.appendChild(h2);
	diceToDom([1, 2], ChildDiv, 'die float-child');
	ChildDiv.childNodes.forEach((i) => i.addEventListener('click', selectDiceAmount));
	parentDiv.appendChild(ChildDiv);
	btns.appendChild(parentDiv);

	inputBox.type = 'text';
	parentDiv.appendChild(inputBox);
	parentDiv.appendChild(createButton('Add Player', 'player-add'));
	btns.appendChild(parentDiv);

	btns.appendChild(createButton('Start Game', 'start'));
}

startScreen();
addEventListener('click', onClick);
