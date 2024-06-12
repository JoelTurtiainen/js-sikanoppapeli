class Player {
	constructor(name) {
		this.name = name;
		this.score = 0;
	}
}

class Game {
	constructor(players, toWin, diceCount) {
		this.players = players;
		this.toWin = toWin;
		this.diceCount = diceCount;
		this.doubles = 0;
		this.turn = -1;
		this.acc = 0;
	}

	processRollEnd(points) {
		this.acc += points;

		console.log(`points: ${points}`);
		console.log(`acc: ${this.acc} doubles: ${this.doubles}`);
		console.log('');

		if (points === 0 || this.doubles >= 3) {
			this.acc = 0;
			this.nextTurn();
		}
	}

	updateDoubles() {
		this.doubles++;
		view.splashText('Doubles');
	}

	updateDiceCount(count) {
		this.diceCount = count;
	}

	nextTurn() {
		this.doubles = 0;

		// True if player holded
		if (this.acc > 0) {
			this.players[this.turn].score += this.acc;
			this.acc = 0;

			// Winning condition
			if (this.players[this.turn].score >= this.toWin) view.gameOver(this.players[this.turn].name);
		}

		// Get next player
		if (this.turn >= this.players.length - 1) {
			this.turn = 0;
		} else {
			this.turn++;
		}

		view.nextTurnDOM(this.players[this.turn].name, this.getPlayerData());
		view.refreshPlayerList(this.getPlayerData());
	}

	getPlayerData() {
		return this.players.map((player) => ({ name: player.name, score: player.score }));
	}
}

class GameView {
	constructor() {
		this.state = 'startScreen';
	}

	//## Game States

	startScreen() {
		const diceButtons = document.getElementById('dice-select');
		const diceCount = localStorage.getItem('diceCount');
		const toWinThreshold = localStorage.getItem('toWin');
		const toWinInput = document.getElementById('to-win');

		if (diceButtons.childNodes.length === 0) this.diceToDom([1, 2], diceButtons, 'select');
		if (diceCount) diceButtons.children[diceCount - 1].classList.add('active');
		if (toWinThreshold) toWinInput.value = toWinThreshold;

		this.state = 'startScreen';
		this.refreshPlayerList();
	}

	startGame() {
		const diceCount = localStorage.getItem('diceCount');
		const dice = document.getElementById('dice-container');
		const gameBtns = document.getElementById('game-buttons');
		gameBtns.classList.remove('none');
		dice.textContent = '';
		this.diceToDom(randomNumber(diceCount), dice);
		game = createNewGame();
		game.nextTurn();
		this.toggleScreen();

		this.state = 'startGame';
		this.refreshPlayerList();
	}

	gameOver(winner) {
		this.state = 'gameOver';
		this.splashText(`${winner} Won!`);
		document.getElementById('game-buttons').classList.add('none');
		setTimeout(() => {
			//this.toggleScreen();
			game = createNewGame();
		}, 5000);

		this.state = 'gameOver';
		this.refreshPlayerList();
	}

	nextTurnDOM(name, playerData) {
		const dice = document.getElementById('dice-container');
		const slideIn = document.querySelector('.slidein');
		this.refreshPlayerList(playerData);

		// Replace whole node so animation resets
		slideIn.innerHTML = `<div class="slidein"><h1>${name}<h1></div>`;

		// Empty Score Queue
		document.querySelector('.score-queue').textContent = '';
		document.querySelector('.acc').textContent = '';

		dice.classList.add('transparent');

		this.state = 'nextTurnDOM';
	}

	//## Dom Manipulation

	onRoll(timer = 1000) {
		this.state = 'onRoll';
		const btns = document.getElementById('game-buttons');
		const dice = document.getElementById('dice-container');
		dice.classList.remove('transparent');
		btns.classList.add('hidden');
		dice.childNodes.forEach((i) => i.classList.add('shake'));

		setTimeout(() => {
			const thrown = randomNumber(game.diceCount);
			const [points, type] = calcScore(thrown);

			btns.classList.remove('hidden');

			dice.textContent = '';
			this.diceToDom(thrown, dice, type);
			game.processRollEnd(points);
			this.updateQueue(points);
		}, timer);
	}

	updateQueue(points) {
		const queue = document.querySelector('.score-queue');
		const accDisplay = document.querySelector('.acc');

		if (points === 0) {
			queue.textContent = '';
			accDisplay.textContent = '';
		} else {
			accDisplay.textContent = `+ ${game.acc}`;
			if (queue.textContent) queue.textContent += '+';
			queue.innerHTML += `${points}`;
		}
	}

	toggleScreen() {
		document.getElementById('back').classList.toggle('hidden');
		document.getElementById('game-container').classList.toggle('none');
		document.getElementById('options').classList.toggle('none');
	}

	diceToDom(list, destination = document.getElementById('dice-container'), type = '') {
		list.map((i) => {
			let dieGrid = createDieGrid(i);
			if (type === 'double1') dieGrid.classList.add('glow');
			if (type === 'select') dieGrid.id = 'die-' + i;
			destination.appendChild(dieGrid);
		});
	}

	splashText(text, time = 2000) {
		document.getElementById(
			'splash'
		).outerHTML = `<h2 id="splash" class="anim-splash">${text}</h2>`;

		setTimeout(() => {
			document.getElementById('splash').innerHTML = '';
		}, time);
	}

	refreshPlayerList() {
		const playersFromStorage = getItemsFromStorage('players');
		const playerList = document.querySelector('.player-list');
		playerList.innerHTML = '';

		if (this.state !== 'startScreen') {
			const playerData = game.getPlayerData();
			playerData.map((i) => (playerList.innerHTML += `<li>${i.name} ${i.score}`));
		} else {
			playersFromStorage.map((name) => (playerList.innerHTML += `<li>${name}</li>`));
		}
	}
}

//## Local Storage

function addPlayerFromInput(e, key = 'players') {
	e.preventDefault();
	const input = document.getElementById('player-input');
	// Sanitize
	const newName = input.value.replace(/[^a-zA-Z ]/g, '');
	if (checkIfItemExists('players', newName)) {
		alert('That item already exists!');
	} else if (newName.trim() !== '') {
		addItemToStorage(key, newName);
		view.refreshPlayerList();
		input.value = '';
	}
}

function removeItem(key, item) {
	if (confirm('Are you sure?')) {
		// Remove item from DOM
		item.remove();

		// Remove item from storage
		removeItemFromStorage(key, item.textContent);

		view.refreshPlayerList();
	}
}

function checkIfItemExists(key, item) {
	const itemsFromStorage = getItemsFromStorage(key);
	return itemsFromStorage.includes(item);
}

function addItemToStorage(key, item) {
	const ItemsFromStorage = getItemsFromStorage(key);

	// Add new item to array
	ItemsFromStorage.push(item);

	// Convert to JSON string and set to local storage
	localStorage.setItem(key, JSON.stringify(ItemsFromStorage));
}

function getItemsFromStorage(key) {
	let ItemsFromStorage;

	if (localStorage.getItem(key) === null) {
		ItemsFromStorage = [];
	} else {
		ItemsFromStorage = JSON.parse(localStorage.getItem(key));
	}

	return ItemsFromStorage;
}

function removeItemFromStorage(key, item) {
	let itemsFromStorage = getItemsFromStorage(key);

	// Filter out item to be removed
	itemsFromStorage = itemsFromStorage.filter((i) => i !== item);

	// Re-set to localstorage
	localStorage.setItem(key, JSON.stringify(itemsFromStorage));
}

function selectDiceCount(e) {
	let selected;
	e.target.parentElement.childNodes.forEach((i) => i.classList.remove('active'));
	e.target.classList.add('active');
	console.log(e.target.id);

	if (e.target.id === 'die-1') selected = 1;
	else selected = 2;

	localStorage.setItem('diceCount', selected);
}

function onInput(e, key = 'toWin') {
	const target = e.target;
	if (target.id === 'to-win') {
		localStorage.setItem(key, e.target.value);
	}
}

function randomNumber(amount) {
	return Array.from({ length: amount }, () => Math.floor(Math.random() * 6) + 1);
}

function createDieGrid(number) {
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
	die.className = 'die float-child';
	die.ariaDescription = number;

	for (let i = 0; i < 9; i++) {
		const icon = document.createElement('i');
		if (matrix[number].includes(i)) {
			icon.className = 'die-dot';
		}
		die.appendChild(icon);
	}
	return die;
}

function calcScore(dice) {
	const [die1, die2] = dice;

	if (die1 === 1 && die2 === 1) {
		game.updateDoubles();
		return [25, 'double1'];
	}

	if (die1 === 1 || die2 === 1) {
		return [0, 'miss'];
	}

	if (die1 === die2) {
		game.updateDoubles();
		return [die1 * 4, 'double'];
	}

	if (dice.length === 2) {
		return [die1 + die2, 'basic'];
	}

	return [die1, ''];
}

function onClick(e) {
	// So beautiful /s
	const id = e.target.id;
	if (id === 'roll') {
		view.onRoll();
	} else if (id === 'hold') {
		game.nextTurn();
	} else if (id === 'start-game') {
		if (getItemsFromStorage('players').length >= 2 && localStorage.getItem('diceCount')) {
			view.startGame();
		}
	} else if (id === 'back' && confirm('Are you sure?')) {
		view.state = 'startScreen';
		view.toggleScreen();
		game = createNewGame();
		view.startScreen();
		view.refreshPlayerList();
	} else if (e.target.parentElement.id === 'dice-select') {
		selectDiceCount(e);
	} else if (
		e.target.parentElement.classList.contains('player-list') &&
		view.state === 'startScreen'
	) {
		removeItem('players', e.target);
	}
}

function createNewGame() {
	let shuffled = getItemsFromStorage('players')
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);

	const players = shuffled.map((i) => new Player(i));

	const winThreshold = localStorage.getItem('toWin') || 100;

	return new Game(players, winThreshold, localStorage.getItem('diceCount'));
}

function init() {
	const view = new GameView();
	const form = document.getElementById('options');
	document.querySelector('main').addEventListener('click', onClick);
	form.addEventListener('submit', addPlayerFromInput);
	form.addEventListener('input', onInput);
	view.startScreen();
	return view;
}

const view = init();
let game;
