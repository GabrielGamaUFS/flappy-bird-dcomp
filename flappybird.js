//board-> Todo esse bloco irá receber dados sobre o "quadro" do jogo
//Decidir deixar a variável no board, pois é onde o jogo será exibido então não tem como deixar como const
let board;
//Dimensões do jogo
const boardWidth = 1600;
const boardHeight = 768;
//Deixei como variável pois ela armazena o contexto de desenho 2D de um elemento HTML chamado "canvas", utilizado para fazer o jogo.
let context;

//bird-> Todo esse bloco irá receber dados sobre a pássaro
//Dimensões do pássaro
const birdWidth = 34; //width/height ratio = 408/228 = 17/12
const birdHeight = 24;
//Posições iniciais do pássaro no jogo
const birdX = boardWidth / 8;
const birdY = boardHeight / 2;

//Atrelando os dados das posições iniciais e das dimensões a x, y, widht e height. Para que seja melhor trabalhado futuramente
const bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//Função que desenha a imagem do pássaro na tela, passando todos os parâmetros quanto as suas dimensões
const birdImage = (img) => {
    const imgBird = () => {
        context.drawImage(img, bird.x, bird.y, bird.width, bird.height);
    }

    img.onload = imgBird

}

//Carrega a imagem do passaro
let birdImg = new Image()
//Teste de uma nova imagem
birdImg.src = "./pixil-frame-0.png"
//Chamada da função
birdImage(birdImg)

//pipes
//Uma array que irá receber os canos (obstáculo do jogo)
let pipeArray = [];
//Dimensões do cano
const pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
const pipeHeight = 512;
//Coordenadas iniciais do cano
const pipeX = boardWidth;
const pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
const easyDif = {
    easy: {
        velocityX: -2,
        gravity: 0.5,
        velocityY: -8,
        pipeInterval: 1500 // 1.5 segundos
    }
}

const mediumDif = {
    medium: {
        velocityX: -4,
        gravity: 0.6,
        velocityY: -9,
        pipeInterval: 800 // 0.8 segundos
    }
}

const hardDif = {
    hard: {
        velocityX: -6,
        gravity: 0.7,
        velocityY: -10,
        pipeInterval: 600 // 0.6 segundos
    }
}

const professionalDif = {
    professional: {
        velocityX: -10,
        gravity: 0.7,
        velocityY: -10,
        pipeInterval: 500 //0.5 segundos
    }
}

// Recupera o parâmetro de dificuldade da URL
const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty');

// Define as configurações com base na dificuldade
let settings;
if (difficulty === "easy") {
    settings = easyDif.easy;
} else if (difficulty === "medium") {
    settings = mediumDif.medium;
} else if (difficulty === "hard") {
    settings = hardDif.hard;
} else if (difficulty === "professional") {
    settings = professionalDif.professional;
} else {
    // Dificuldade padrão ou tratamento de erro
    settings = mediumD.medium;
}

// Use as configurações em settings para o jogo
let { velocityX, gravity, velocityY } = settings;

let gameOver = false;
let score = 0;

const imgLoad = () => {
    board = document.getElementById("board");
    board.height = 735;
    board.width = 1500;
     context = board.getContext("2d");

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    //O intervalo de tempo da aparição dos canos irá mudar conforme o nível
    const pipeInterval = settings.pipeInterval;
    setInterval(placePipes, pipeInterval);
    document.addEventListener("keydown", moveBird);
}

window.onload = imgLoad;

const update = () => {
    setTimeout(update, 1000 / 60);

    if (gameOver) {
        restartGame(); // Chame restartGame imediatamente quando o jogo terminar
    }

    if (gameOver != false) {
        return;
    }
    
    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    pipeArray = pipeArray.map(pipe => {
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }

        return pipe;
    });

    // Limpa as tubulações que passaram do quadro
    pipeArray = pipeArray.filter(pipe => pipe.x >= -pipeWidth);

    // Desenha a pontuação na tela
    context.fillStyle = "white";
    context.font = "30px Arial";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText(5, 90);
    }
}

const placePipes = () => {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    const randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    const openingSpace = board.height/4;

    const topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    const bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray = pipeArray.concat([topPipe, bottomPipe]);
}

// Tela que será chamada quando o jogador perder, para ser habilitada a escolha de recomeçar ou escolher a dificuldade
const restartGame = () => { 
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    const divGameOver = document.getElementById("gameover");
    divGameOver.style.display = "block"; // Sempre exibir a tela "Play Again"
}

// Atualizará a página, após clicar em Play Again
const playAgain = () => {
    location.reload();
}

// Pula o pássaro se as teclas "Space", "ArrowUp" ou "KeyX" forem pressionadas
const moveBird = (movement) => { 
    if (movement.code == "Space" || movement.code == "ArrowUp" || movement.code == "KeyX") {
        velocityY = -6;
    }
}

const detectCollision = (bird, pipe) => {
    if (
        bird.x + bird.width > pipe.x &&
        bird.x < pipe.x + pipe.width &&
        bird.y + bird.height > pipe.y &&
        bird.y < pipe.y + pipe.height
    ) {
        return true;
    }
    return false;
}

//Consertando Bug
//Função que permite que as teclas espaço e seta pra cima sejam executadas e bloqueia qualquer outra tecla a não ser elas duas
const blocking_keys = () => {document.addEventListener('keydown', function(event) {
    const Keys = [' ', 'ArrowUp']
    if (!Keys.includes(event.key)) {
        event.preventDefault()
    }
})}

blocking_keys();
