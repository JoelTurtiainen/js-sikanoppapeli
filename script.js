class Player {
	constructor(name) {
		this.name = name;
		this.score = 0;
	}
}

class Game {
	constructor() {
		this.turn = -1;
		this.diceCount = 0;
		this.doubles = 0;
		this.toWin = 10;
		this.acc = 0;
		this.players = [];
	}

	processRollEnd(points) {
		this.acc += points;

		if (points === 0 || this.doubles >= 3) {
			this.acc = 0;
			this.nextTurn();
		} else if (this.acc + this.players[this.turn].score >= this.toWin) {
			console.log('Game over');
		}

		console.log(`points: ${points}`);
		console.log(`acc: ${this.acc} doubles: ${this.doubles}`);
		console.log('');
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

		// Update player list
		view.displayCurrentPlayer(this.players[this.turn].name);
		const playerData = this.getPlayerData();

		//Update current player text
		view.displayPlayerList(playerData);
	}

	getPlayerData() {
		return this.players.map((player) => ({ name: player.name, score: player.score }));
	}
}

class GameView {
	constructor() {
		this.diceContainer = document.querySelector('#dice');
		this.btns = document.querySelector('.btn-container');
	}

	startGame() {
		this.diceContainer.classList.remove('small');
		this.diceContainer.textContent = '';
		this.diceToDom(randomNumber(game.diceCount), this.diceContainer);
		this.btns.innerHTML = `<button id="roll">Roll The Dice</button><button id="hold">Hold</button>`;
		game.nextTurn();
	}

	onRoll(timer = 1000) {
		this.btns.classList.add('hidden');
		this.diceContainer.childNodes.forEach((i) => i.classList.add('shake'));

		setTimeout(() => {
			const thrown = randomNumber(game.diceCount);
			const points = calcScore(thrown);

			this.btns.classList.remove('hidden');
			this.diceContainer.textContent = '';
			this.diceContainer.classList.remove('transparent');
			const queue = document.querySelector('.score-queue');
			queue.innerHTML = `<li>${points}<li>` + queue.innerHTML;

			game.processRollEnd(points);
			this.diceToDom(thrown, this.diceContainer);
		}, timer);
	}

	diceToDom(list, parent, classes = 'die') {
		list.map((i) => parent.appendChild(createDieGrid(i, classes)));
	}

	addPlayerFromInput() {
		const input = document.querySelector('input');
		if (input.value.trim() !== '') {
			game.addPlayer(input.value);
			input.value = '';
		}
	}

	displayCurrentPlayer(name) {
		const slideIn = document.querySelector('.slidein');

		// Replace whole node so animation resets
		slideIn.outerHTML = `<div class="slidein"><h1>${name}<h1></div>`;

		// Empty Score Queue
		document.querySelector('.score-queue').textContent = '';

		this.diceContainer.classList.add('transparent');
	}

	displayPlayerList(playerData) {
		const playerList = document.querySelector('.player-list > ul');

		playerList.innerHTML = '';

		playerData.map((i) => {
			console.log(i.name, i.score);
			playerList.innerHTML += `<li>${i.name} ${i.score}</li>`;
		});
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

	startScreen() {
		//TODO: option to remove player

		// 'Buttons' to select dicecount
		const floatContainer = document.querySelector('.float-container');
		this.diceToDom([1, 2], floatContainer, 'die float-child');
	}
}

function onClick(e) {
	const classes = e.target.id;
	switch (classes) {
		case 'roll':
			view.onRoll();
			break;

		case 'hold':
			game.nextTurn();
			break;

		case 'start':
			if (game.players.length >= 2 && game.diceCount) view.startGame();
			break;

		case 'player-add':
			view.addPlayerFromInput();
			break;
	}
}

function randomNumber(amount) {
	return Array.from({ length: amount }, () => Math.floor(Math.random() * 6) + 1);
}

function createDieGrid(number, classes) {
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
		const icon = document.createElement('i');
		if (matrix[number].includes(i)) {
			icon.className = 'circle';
		}
		die.appendChild(icon);
	}
	return die;
}

function calcScore(dice) {
	const [die1, die2] = dice;

	if (die1 === 1 && die2 === 1) {
		return 25;
	}

	if (die1 === 1 || die2 === 1) {
		return 0;
	}

	if (die1 === die2) {
		game.doubles++;
		return die1 * 4;
	}

	if (dice.length === 2) {
		return die1 + die2;
	}

	return die1;
}

function init(debug = false) {
	view.startScreen();
	addEventListener('click', onClick);
	document.querySelector('.float-container').addEventListener('click', view.onClickDie);

	if (debug) {
		game.diceCount = 2;
		game.addPlayer('First');
		game.addPlayer('Second');
	}
}

const view = new GameView();
const game = new Game();

init(true);
