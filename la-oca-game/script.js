const boardSize = 50; // 5 rows x 10 columns
const boardElement = document.getElementById('board');
const rollDiceBtn = document.getElementById('roll-dice');
const diceResultElement = document.getElementById('dice-result');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers');
const messageElement = document.getElementById('message');
const playersInfo = document.getElementById('players-info');

const numPlayers = 2; // Number of players (can be increased)
let currentPlayer = 0;
let playerPositions = new Array(numPlayers).fill(0);
let waitingForAnswer = false;

// Updated questions for teenagers 16+ about Spain (2000-2025)
const questions = [
  {
    question: "¿Dónde está ubicada la Universidad de Salamanca?",
    answers: ["Salamanca", "Madrid", "Barcelona", "Valencia"],
    correct: 0
  },
  {
    question: "¿En qué año España ganó la Copa Mundial de Fútbol?",
    answers: ["2010", "2006", "2014", "2018"],
    correct: 0
  },
  {
    question: "¿Cuál es la capital de España?",
    answers: ["Barcelona", "Madrid", "Sevilla", "Valencia"],
    correct: 1
  },
  {
    question: "¿Qué evento importante se celebró en Barcelona en 2004?",
    answers: ["Juegos Olímpicos", "Expo Mundial", "Ninguno", "Eurocopa"],
    correct: 2
  },
  {
    question: "¿Cuál es el río más largo que atraviesa España?",
    answers: ["Ebro", "Tajo", "Guadalquivir", "Duero"],
    correct: 1
  },
  {
    question: "¿En qué ciudad española se encuentra la Sagrada Familia?",
    answers: ["Madrid", "Barcelona", "Valencia", "Sevilla"],
    correct: 1
  },
  {
    question: "¿Qué comunidad autónoma tiene como capital a Sevilla?",
    answers: ["Andalucía", "Cataluña", "Galicia", "País Vasco"],
    correct: 0
  },
  {
    question: "¿En qué año se aprobó la Constitución Española actual?",
    answers: ["1978", "2000", "1982", "1995"],
    correct: 0
  },
  {
    question: "¿Qué ciudad española es famosa por su festival de San Fermín?",
    answers: ["Pamplona", "Bilbao", "Granada", "Zaragoza"],
    correct: 0
  },
  {
    question: "¿Cuál es el deporte más popular en España?",
    answers: ["Baloncesto", "Fútbol", "Tenis", "Ciclismo"],
    correct: 1
  }
];

const boardImages = {
  3: { src: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Sevillana_dancer_vector.svg', alt: 'Sevillana - Andalucía' },
  6: { src: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Aragon.svg', alt: 'Castillo - Aragón' },
  9: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Flag_of_Asturias.svg/1200px-Flag_of_Asturias.svg.png', alt: 'Asturias' },
  12: { src: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Festes_de_Sant_Joan_-_Menorca_-_2013_-_caballos_01.jpg', alt: 'Fiestas típicas de Menorca con caballos - Islas Baleares' },
  15: { src: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_the_Basque_Country.svg', alt: 'Trajes típicos - País Vasco' },
  18: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Canary_Islands.svg/1200px-Flag_of_Canary_Islands.svg.png', alt: 'Islas Canarias' },
  21: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_Cantabria.svg/1200px-Flag_of_Cantabria.svg.png', alt: 'Cantabria' },
  24: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_Castile_and_León.svg/1200px-Flag_of_Castile_and_León.svg.png', alt: 'Castilla y León' },
  27: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Flag_of_Castile-La_Mancha.svg/1200px-Flag_of_Castile-La_Mancha.svg.png', alt: 'Castilla-La Mancha' },
  30: { src: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Colla_castellers_de_Sant_Cugat_2013.jpg', alt: 'Castellers - Cataluña' },
  33: { src: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Paella_de_marisco_01.jpg', alt: 'Paella - Comunidad Valenciana' },
  36: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_Extremadura.svg/1200px-Flag_of_Extremadura.svg.png', alt: 'Extremadura' },
  39: { emoji: '🌾', alt: 'Galicia' },
  42: { src: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Oso_y_madrono_Madrid.jpg', alt: 'Oso y Madroño - Comunidad de Madrid' },
  45: { emoji: '🌴', alt: 'Región de Murcia' },
  48: { emoji: '⛰️', alt: 'Navarra' },
  50: { emoji: '🍇', alt: 'La Rioja' }
};

// Generate player info display
function generatePlayersInfo() {
  playersInfo.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'flex items-center space-x-2';
    const token = document.createElement('div');
    token.className = `player-token token-${i}`;
    playerDiv.appendChild(token);
    const label = document.createElement('span');
    label.textContent = i === currentPlayer ? `Jugador ${i + 1} (Tu turno)` : `Jugador ${i + 1}`;
    label.className = i === currentPlayer ? 'font-bold text-blue-600' : 'text-gray-700';
    playerDiv.appendChild(label);
    playersInfo.appendChild(playerDiv);
  }
}

function generateBoard() {
  boardElement.innerHTML = '';
  for (let i = 1; i <= boardSize; i++) {
    const square = document.createElement('div');
    square.textContent = i;
    square.classList.add('border', 'border-gray-300', 'bg-white');
    if (Object.keys(boardImages).includes(i.toString())) {
      square.classList.add('special-square');
      const imgInfo = boardImages[i];
      if (imgInfo.emoji) {
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = imgInfo.emoji;
        emojiSpan.className = 'board-image text-2xl';
        emojiSpan.style.position = 'absolute';
        emojiSpan.style.top = '4px';
        emojiSpan.style.left = '4px';
        square.appendChild(emojiSpan);
      } else if (imgInfo.src) {
        const img = document.createElement('img');
        img.src = imgInfo.src;
        img.alt = imgInfo.alt;
        img.className = 'board-image';
        square.appendChild(img);
      }
    }
    boardElement.appendChild(square);
  }
  updatePlayerPositions();
}

// Update player positions on the board
function updatePlayerPositions() {
  const squares = boardElement.children;
  for (let i = 0; i < squares.length; i++) {
    // Remove all player tokens from squares
    const tokens = squares[i].querySelectorAll('.player-token');
    tokens.forEach(token => token.remove());
  }
  // Add player tokens to their positions
  playerPositions.forEach((pos, playerIndex) => {
    if (pos > 0 && pos <= boardSize) {
      const square = squares[pos - 1];
      const token = document.createElement('div');
      token.className = `player-token token-${playerIndex}`;
      square.appendChild(token);
    }
  });
}

// Roll dice and trigger question for current player
function rollDice() {
  if (waitingForAnswer) {
    messageElement.textContent = "Por favor, responde la pregunta antes de tirar el dado.";
    return;
  }
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  diceResultElement.textContent = `Jugador ${currentPlayer + 1} ha sacado un ${diceRoll}`;
  askQuestion(diceRoll);
}

// Ask a random question
function askQuestion(diceRoll) {
  waitingForAnswer = true;
  messageElement.textContent = "";
  questionContainer.classList.remove('hidden');
  const qIndex = Math.floor(Math.random() * questions.length);
  const q = questions[qIndex];
  questionText.textContent = q.question;
  answersContainer.innerHTML = '';
  q.answers.forEach((answer, index) => {
    const btn = document.createElement('button');
    btn.textContent = answer;
    btn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-300';
    btn.onclick = () => checkAnswer(index, q.correct, diceRoll);
    answersContainer.appendChild(btn);
  });
}

// Check answer and update position and turn
function checkAnswer(selected, correct, diceRoll) {
  waitingForAnswer = false;
  questionContainer.classList.add('hidden');
  if (selected === correct) {
    playerPositions[currentPlayer] += diceRoll;
    if (playerPositions[currentPlayer] > boardSize) playerPositions[currentPlayer] = boardSize;
    updatePlayerPositions();
    messageElement.textContent = `¡Correcto! Jugador ${currentPlayer + 1} avanza ${diceRoll} casillas.`;
    if (playerPositions[currentPlayer] === boardSize) {
      messageElement.textContent = `¡Felicidades! Jugador ${currentPlayer + 1} ha ganado el juego.`;
      rollDiceBtn.disabled = true;
      return;
    }
  } else {
    messageElement.textContent = `Respuesta incorrecta. Jugador ${currentPlayer + 1} no avanza esta vez.`;
  }
  // Next player's turn
  currentPlayer = (currentPlayer + 1) % numPlayers;
  generatePlayersInfo();
  diceResultElement.textContent = '';
}

rollDiceBtn.addEventListener('click', rollDice);

generatePlayersInfo();
generateBoard();
