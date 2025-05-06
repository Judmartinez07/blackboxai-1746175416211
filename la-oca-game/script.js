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

let consecutiveCorrect = new Array(numPlayers).fill(0);
let playerStars = new Array(numPlayers).fill(0);
let playerPoints = new Array(numPlayers).fill(0);

// Create dedicated points display elements for each player on top left and right corners
const playerPointsLeft = document.createElement('div');
playerPointsLeft.id = 'player-points-left';
playerPointsLeft.className = 'fixed top-4 left-4 bg-white p-2 rounded shadow-lg text-green-700 font-bold text-lg z-50';

const playerPointsRight = document.createElement('div');
playerPointsRight.id = 'player-points-right';
playerPointsRight.className = 'fixed top-4 right-4 bg-white p-2 rounded shadow-lg text-green-700 font-bold text-lg z-50';

document.body.appendChild(playerPointsLeft);
document.body.appendChild(playerPointsRight);

function updatePointsDisplay() {
  playerPointsLeft.innerHTML = `<div class="font-bold text-xl mb-1">SCORE</div>Jugador 1: ${playerPoints[0]} puntos ⭐${playerStars[0]}`;
  if (numPlayers > 1) {
    playerPointsRight.innerHTML = `<div class="font-bold text-xl mb-1">SCORE</div>Jugador 2: ${playerPoints[1]} puntos ⭐${playerStars[1]}`;
  }

  // Update main score display in game area
  const scoreDisplay = document.getElementById('score-display');
  if (scoreDisplay) {
    let scoreText = '';
    for (let i = 0; i < numPlayers; i++) {
      scoreText += `Jugador ${i + 1}: ${playerPoints[i]} puntos ⭐${playerStars[i]}<br>`;
    }
    scoreDisplay.innerHTML = scoreText;
  }
}

function generatePlayersInfo() {
  playersInfo.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'flex items-center space-x-2';

    // Stars display
    const starsDiv = document.createElement('div');
    starsDiv.className = 'flex space-x-1';
    for (let s = 0; s < playerStars[i]; s++) {
      const star = document.createElement('span');
      star.textContent = '⭐';
      star.className = 'text-yellow-400';
      starsDiv.appendChild(star);
    }
    playerDiv.appendChild(starsDiv);

    // Player token
    const token = document.createElement('div');
    token.className = `player-token token-${i}`;
    playerDiv.appendChild(token);

    // Player label
    const label = document.createElement('span');
    label.textContent = i === currentPlayer ? `Jugador ${i + 1} (Tu turno)` : `Jugador ${i + 1}`;
    label.className = i === currentPlayer ? 'font-bold text-blue-600' : 'text-gray-700';
    playerDiv.appendChild(label);

    playersInfo.appendChild(playerDiv);
  }
  updatePointsDisplay();
}

// Updated questions for teenagers 16+ about Spain (2000-2025)
const questions = [
  { question: "¿Qué famoso cantante español lanzó el álbum 'El Mal Querer' en 2018?", answers: ["Rosalía", "Aitana", "Pablo Alborán", "David Bisbal"], correct: 0 },
  { question: "¿En qué ciudad española se celebra el festival de música electrónica 'Sónar'?", answers: ["Madrid", "Barcelona", "Valencia", "Sevilla"], correct: 1 },
  { question: "¿Cuál es la red social más popular entre los adolescentes en España en 2025?", answers: ["Facebook", "Instagram", "TikTok", "Twitter"], correct: 2 },
  { question: "¿Qué equipo de fútbol ganó La Liga en la temporada 2022-2023?", answers: ["Real Madrid", "Barcelona", "Atlético de Madrid", "Sevilla"], correct: 0 },
  { question: "¿Qué famoso parque temático abrió en Madrid en 2021?", answers: ["PortAventura", "Isla Mágica", "Parque Warner", "Parque Europa"], correct: 2 },
  { question: "¿Qué serie española de Netflix ganó popularidad mundial en 2020?", answers: ["La Casa de Papel", "Élite", "Las Chicas del Cable", "Vis a Vis"], correct: 0 },
  { question: "¿Qué famoso festival de cine se celebra en San Sebastián?", answers: ["Festival de Cannes", "Festival de Berlín", "Festival de San Sebastián", "Festival de Venecia"], correct: 2 },
  { question: "¿Cuál es la comida típica que se come en las Fallas de Valencia?", answers: ["Paella", "Tortilla de patatas", "Gazpacho", "Pulpo a la gallega"], correct: 0 },
  { question: "¿Qué cantante ganó Eurovisión para España en 1968 y es un ícono cultural?", answers: ["Massiel", "Rosa López", "Chiquilicuatre", "David Civera"], correct: 0 },
  { question: "¿Qué famoso deportista español es conocido por ganar múltiples títulos de tenis?", answers: ["Rafael Nadal", "Pau Gasol", "Fernando Alonso", "Iker Casillas"], correct: 0 },
  { question: "¿Cuál es la capital de España?", answers: ["Barcelona", "Madrid", "Sevilla", "Valencia"], correct: 1 },
  { question: "¿Qué ciudad española es famosa por su festival de San Fermín?", answers: ["Pamplona", "Bilbao", "Granada", "Zaragoza"], correct: 0 },
  { question: "¿Qué instrumento musical es típico en la música flamenca?", answers: ["Guitarra", "Piano", "Violín", "Saxofón"], correct: 0 },
  { question: "¿Cuál es el plato tradicional de la región de Galicia?", answers: ["Pulpo a la gallega", "Paella", "Gazpacho", "Tortilla"], correct: 0 },
  { question: "¿Qué famoso arquitecto diseñó la Sagrada Familia en Barcelona?", answers: ["Antoni Gaudí", "Pablo Picasso", "Salvador Dalí", "Joan Miró"], correct: 0 },
  { question: "¿En qué año se celebraron los Juegos Olímpicos en Barcelona?", answers: ["1992", "1988", "2000", "1996"], correct: 0 },
  { question: "¿Qué baile tradicional es típico de Andalucía?", answers: ["Flamenco", "Salsa", "Tango", "Merengue"], correct: 0 },
  { question: "¿Cuál es el idioma cooficial en Cataluña además del español?", answers: ["Catalán", "Gallego", "Vasco", "Valenciano"], correct: 0 },
  { question: "¿Qué ciudad es conocida por su acueducto romano?", answers: ["Segovia", "Toledo", "Salamanca", "Córdoba"], correct: 0 },
  { question: "¿Qué famoso pintor español es conocido por el cubismo?", answers: ["Pablo Picasso", "Salvador Dalí", "Francisco Goya", "Diego Velázquez"], correct: 0 },
  { question: "¿Qué fiesta española incluye la tradición de lanzar tomates?", answers: ["La Tomatina", "San Fermín", "Fallas", "Semana Santa"], correct: 0 },
  { question: "¿Cuál es el nombre del famoso parque en Madrid con un oso y un madroño?", answers: ["Parque del Retiro", "Parque Warner", "Parque Europa", "Parque de la Ciudadela"], correct: 0 },
  { question: "¿Qué bebida es típica en España y se sirve fría con frutas?", answers: ["Sangría", "Cerveza", "Vino tinto", "Café"], correct: 0 },
  { question: "¿Qué ciudad española es famosa por su arquitectura modernista?", answers: ["Barcelona", "Madrid", "Sevilla", "Valencia"], correct: 0 },
  { question: "¿Qué equipo de fútbol tiene el apodo 'Los Blancos'?", answers: ["Real Madrid", "Barcelona", "Atlético de Madrid", "Sevilla"], correct: 0 },
  { question: "¿Qué isla española es conocida por sus playas y vida nocturna?", answers: ["Ibiza", "Mallorca", "Tenerife", "Gran Canaria"], correct: 0 },
  { question: "¿Qué famoso festival se celebra en Valencia en marzo?", answers: ["Fallas", "San Fermín", "La Tomatina", "Carnaval"], correct: 0 },
  { question: "¿Qué ciudad es conocida por su catedral gótica y universidad antigua?", answers: ["Salamanca", "Toledo", "Granada", "Córdoba"], correct: 0 },
  { question: "¿Qué famoso pintor español es conocido por sus obras surrealistas?", answers: ["Salvador Dalí", "Pablo Picasso", "Francisco Goya", "Diego Velázquez"], correct: 0 },
  { question: "¿Qué instrumento se usa en la música tradicional gallega?", answers: ["Gaita", "Flauta", "Violín", "Piano"], correct: 0 },
  { question: "¿Qué ciudad española es famosa por su festival de Semana Santa?", answers: ["Sevilla", "Madrid", "Barcelona", "Valencia"], correct: 0 },
  { question: "¿Qué plato típico se come en la región de Murcia?", answers: ["Caldero", "Paella", "Gazpacho", "Pulpo a la gallega"], correct: 0 },
  { question: "¿Qué famoso arquitecto diseñó el Parque Güell?", answers: ["Antoni Gaudí", "Pablo Picasso", "Salvador Dalí", "Joan Miró"], correct: 0 },
  { question: "¿Qué ciudad española es conocida por su acueducto romano?", answers: ["Segovia", "Toledo", "Salamanca", "Córdoba"], correct: 0 },
  { question: "¿Qué famoso pintor español es conocido por el cubismo?", answers: ["Pablo Picasso", "Salvador Dalí", "Francisco Goya", "Diego Velázquez"], correct: 0 },
  { question: "¿Qué fiesta española incluye la tradición de lanzar tomates?", answers: ["La Tomatina", "San Fermín", "Fallas", "Semana Santa"], correct: 0 },
  { question: "¿Cuál es el nombre del famoso parque en Madrid con un oso y un madroño?", answers: ["Parque del Retiro", "Parque Warner", "Parque Europa", "Parque de la Ciudadela"], correct: 0 },
  { question: "¿Qué bebida es típica en España y se sirve fría con frutas?", answers: ["Sangría", "Cerveza", "Vino tinto", "Café"], correct: 0 },
  { question: "¿Qué ciudad española es famosa por su arquitectura modernista?", answers: ["Barcelona", "Madrid", "Sevilla", "Valencia"], correct: 0 },
  { question: "¿Qué equipo de fútbol tiene el apodo 'Los Blancos'?", answers: ["Real Madrid", "Barcelona", "Atlético de Madrid", "Sevilla"], correct: 0 },
  { question: "¿Qué isla española es conocida por sus playas y vida nocturna?", answers: ["Ibiza", "Mallorca", "Tenerife", "Gran Canaria"], correct: 0 },
  { question: "¿Qué famoso festival se celebra en Valencia en marzo?", answers: ["Fallas", "San Fermín", "La Tomatina", "Carnaval"], correct: 0 },
  { question: "¿Qué ciudad es conocida por su catedral gótica y universidad antigua?", answers: ["Salamanca", "Toledo", "Granada", "Córdoba"], correct: 0 },
  { question: "¿Qué famoso pintor español es conocido por sus obras surrealistas?", answers: ["Salvador Dalí", "Pablo Picasso", "Francisco Goya", "Diego Velázquez"], correct: 0 },
  { question: "¿Qué instrumento se usa en la música tradicional gallega?", answers: ["Gaita", "Flauta", "Violín", "Piano"], correct: 0 },
  { question: "¿Qué ciudad española es famosa por su festival de Semana Santa?", answers: ["Sevilla", "Madrid", "Barcelona", "Valencia"], correct: 0 },
  { question: "¿Qué plato típico se come en la región de Murcia?", answers: ["Caldero", "Paella", "Gazpacho", "Pulpo a la gallega"], correct: 0 },
  { question: "¿Qué famoso arquitecto diseñó el Parque Güell?", answers: ["Antoni Gaudí", "Pablo Picasso", "Salvador Dalí", "Joan Miró"], correct: 0 }
];

const boardImages = {
  3: { src: 'images/sevillana.svg', alt: 'Sevillana - Andalucía' },
  6: { src: 'images/castillo.svg', alt: 'Castillo - Aragón' },
  9: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Flag_of_Asturias.svg/1200px-Flag_of_Asturias.svg.png', alt: 'Asturias' },
  12: { src: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Festes_de_Sant_Joan_-_Menorca_-_2013_-_caballos_01.jpg', alt: 'Fiestas típicas de Menorca con caballos - Islas Baleares' },
  15: { src: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_the_Basque_Country.svg', alt: 'Trajes típicos - País Vasco' },
  18: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Canary_Islands.svg/1200px-Flag_of_Canary_Islands.svg.png', alt: 'Islas Canarias' },
  21: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_Cantabria.svg/1200px-Flag_of_Cantabria.svg.png', alt: 'Cantabria' },
  24: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_Castile_and_León.svg/1200px-Flag_of_Castile_and_León.svg.png', alt: 'Castilla y León' },
  27: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Flag_of_Castile-La_Mancha.svg/1200px-Flag_of_Castile-La_Mancha.svg.png', alt: 'Castilla-La Mancha' },
  30: { src: 'images/castellers.svg', alt: 'Castellers - Cataluña' },
  33: { src: 'images/paella.svg', alt: 'Paella - Comunidad Valenciana' },
  36: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_Extremadura.svg/1200px-Flag_of_Extremadura.svg.png', alt: 'Extremadura' },
  39: { emoji: '🌾', alt: 'Galicia' },
  42: { src: 'images/oso_madrono.svg', alt: 'Oso y Madroño - Comunidad de Madrid' },
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

// Ask a question cycling through questions without repetition
let availableQuestions = [...questions];

function askQuestion(diceRoll) {
  waitingForAnswer = true;
  messageElement.textContent = "";
  questionContainer.classList.remove('hidden');

  if (availableQuestions.length === 0) {
    availableQuestions = [...questions];
  }

  const qIndex = Math.floor(Math.random() * availableQuestions.length);
  const q = availableQuestions[qIndex];
  availableQuestions.splice(qIndex, 1);

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

function checkAnswer(selected, correct, diceRoll) {
  waitingForAnswer = false;
  questionContainer.classList.add('hidden');
  if (selected === correct) {
    playerPositions[currentPlayer] += diceRoll;
    if (playerPositions[currentPlayer] > boardSize) playerPositions[currentPlayer] = boardSize;
    updatePlayerPositions();
    messageElement.textContent = `¡Correcto! Jugador ${currentPlayer + 1} avanza ${diceRoll} casillas.`;

    // Update points
    playerPoints[currentPlayer] += 10;

    // Update consecutive correct answers and stars
    consecutiveCorrect[currentPlayer]++;
    if (consecutiveCorrect[currentPlayer] === 3) {
      playerStars[currentPlayer]++;
      consecutiveCorrect[currentPlayer] = 0;
      messageElement.textContent += ` ¡Jugador ${currentPlayer + 1} ha ganado una estrella dorada! ⭐`;
    }

    if (playerPositions[currentPlayer] === boardSize) {
      messageElement.textContent = `¡Felicidades! Jugador ${currentPlayer + 1} ha ganado el juego y todas las estrellas doradas.`;
      rollDiceBtn.disabled = true;

      // Award all stars to winner
      for (let i = 0; i < numPlayers; i++) {
        playerStars[i] = 0;
      }
      playerStars[currentPlayer] = 3; // Assuming 3 stars to win
      generatePlayersInfo();
      return;
    }
  } else {
    messageElement.textContent = `Respuesta incorrecta. Jugador ${currentPlayer + 1} no avanza esta vez.`;
    consecutiveCorrect[currentPlayer] = 0;
  }
  // Next player's turn
  currentPlayer = (currentPlayer + 1) % numPlayers;
  generatePlayersInfo();
  diceResultElement.textContent = '';
}

rollDiceBtn.addEventListener('click', rollDice);

generatePlayersInfo();
generateBoard();
