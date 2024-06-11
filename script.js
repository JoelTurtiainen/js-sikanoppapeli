class Player {
	constructor(name) {
		this.name = name;
		this.score = 0;
	}
}

class Game {
	constructor() {
		this.running = false;
		this.turn = -1;
		this.diceCount = 0;
		this.doubles = 0;
		this.toWin = 100;
		this.acc = 0;
		this.players = [];
	}

	processRollEnd(points) {
		this.acc += points;

		console.log(`points: ${points}`);
		console.log(`acc: ${this.acc} doubles: ${this.doubles}`);
		console.log('');

		if (points === 0 || this.doubles >= 3) {
			this.acc = 0;
			this.nextTurn();
		} else if (this.acc + this.players[this.turn].score >= this.toWin) {
			this.running = false;
			view.gameOver(this.players[this.turn].name);
		}
	}

	updateDoubles() {
		this.doubles++;
		view.splashText('Doubles');
	}

	updateDiceCount(count) {
		this.diceCount = count;
	}

	addPlayer(name) {
		this.players.push(new Player(name));

		// Update player list
		const playerData = this.getPlayerData();
		view.displayPlayerList(playerData);
	}

	nextTurn() {
		this.doubles = 0;

		// True if player holded
		if (this.acc > 0) {
			this.players[this.turn].score += this.acc;
			this.acc = 0;
		}

		// Get next player
		if (this.turn >= this.players.length - 1) {
			this.turn = 0;
		} else {
			this.turn++;
		}

		view.nextTurnDOM(this.players[this.turn].name, this.getPlayerData());
	}

	getPlayerData() {
		return this.players.map((player) => ({ name: player.name, score: player.score }));
	}
}

class GameView {
	constructor() {}

	//## Game States

	startScreen() {
		const diceSelect = document.getElementById('dice-select');
		// 'Buttons' to select dicecount
		if (diceSelect.childNodes.length === 0) {
			this.diceToDom([1, 2], diceSelect);
		}
	}

	startGame() {
		this.toggleScreen();
		const dice = document.getElementById('dice-container');
		this.diceToDom(randomNumber(game.diceCount), dice);
		game.running = true;
		game.nextTurn();
	}

	gameOver(winner) {
		this.splashText(`${winner} Won!`);
		document.getElementById('game-buttons').classList.add('none');
		setTimeout(() => {
			//this.toggleScreen();
			game = init();
		}, 5000);
	}

	nextTurnDOM(name, playerData) {
		const dice = document.getElementById('dice-container');
		const slideIn = document.querySelector('.slidein');
		this.displayPlayerList(playerData);

		// Replace whole node so animation resets
		slideIn.innerHTML = `<div class="slidein"><h1>${name}<h1></div>`;

		// Empty Score Queue
		document.querySelector('.score-queue').textContent = '';
		document.querySelector('.acc').textContent = '';

		dice.classList.add('transparent');
	}

	//## Dom Manipulation

	onRoll(timer = 1000) {
		const btns = document.getElementById('game-buttons');
		const dice = document.getElementById('dice-container');
		dice.classList.remove('transparent');
		btns.classList.add('hidden');
		dice.childNodes.forEach((i) => i.classList.add('shake'));

		// TODO: cancel timeout
		setTimeout(() => {
			const thrown = randomNumber(game.diceCount);
			const points = calcScore(thrown);

			btns.classList.remove('hidden');

			dice.textContent = '';
			this.diceToDom(thrown, dice);
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

	diceToDom(list, destination = document.getElementById('dice-container')) {
		list.map((i) => destination.appendChild(createDieGrid(i)));
	}

	splashText(text, time = 2000) {
		document.getElementById(
			'splash'
		).outerHTML = `<h2 id="splash" class="anim-splash">${text}</h2>`;

		setTimeout(() => {
			document.getElementById('splash').innerHTML = '';
		}, time);
	}

	displayPlayerList(playerData) {
		const playerList = document.querySelector('.player-list');
		playerList.innerHTML = '';

		playerData.map((i) => {
			console.log(i.name, i.score);
			playerList.innerHTML += `<li>${i.name} ${i.score}</li>`;
		});
	}

	//## Input handlers

	addPlayerFromInput(e) {
		e.preventDefault();
		const input = document.getElementById('player-input');
		if (input.value.trim() !== '') {
			game.addPlayer(input.value);
			input.value = '';
		}
	}

	onClickDie(e) {
		if (game.turn === -1) {
			const siblings = e.target.parentElement.childNodes;
			if (e.target.classList.contains('die')) {
				siblings.forEach((i) => i.classList.remove('active'));
				e.target.classList.add('active');

				game.updateDiceCount(1 + Array.prototype.indexOf.call(siblings, e.target));
			}
		}
	}

	onInput(e) {
		const target = e.target;
		console.log(e.target.value);
		if (target.id === 'to-win') {
			game.toWin = target.value;
		}
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
		return 25;
	}

	if (die1 === 1 || die2 === 1) {
		return 0;
	}

	if (die1 === die2) {
		game.updateDoubles();
		return die1 * 4;
	}

	if (dice.length === 2) {
		return die1 + die2;
	}

	return die1;
}

function onClick(e) {
	const id = e.target.id;
	switch (id) {
		case 'roll':
			view.onRoll();
			break;

		case 'hold':
			game.nextTurn();
			break;

		case 'start-game':
			if (game.players.length >= 2 && game.diceCount) view.startGame();
			break;

		case 'back':
			if (confirm('Are you sure?')) {
				view.toggleScreen();
				game = init();
				game.running = false;
			}
	}
}

function init(debug = false) {
	const game = new Game();
	const form = document.getElementById('options');
	form.addEventListener('submit', view.addPlayerFromInput);
	form.addEventListener('click', view.onClickDie);
	form.addEventListener('input', view.onInput);
	view.startScreen();
	addEventListener('click', onClick);

	if (debug) {
		game.toWin = 100;
		game.diceCount = 2;
		game.addPlayer('First');
		game.addPlayer('Second');
	}
	return game;
}

const view = new GameView();
let game = init();
