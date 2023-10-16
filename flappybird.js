//board-> Todo esse bloco irá receber dados sobre o "quadro" do jogo
//Decidir deixar a variável no board, pois é onde o jogo será exibido então não tem como deixar como const
let board;

//Dimensões do jogo
const boardWidth = 1920;
const boardHeight = 860;

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
birdImg.src = "./pixil-frame-03.png"
//Chamada da função
birdImage(birdImg)

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

// Física do jogo, determinando a velocidade do cano, a gravidade do pássaro conforme a dificuldade escolhida
const easyDif = {
    easy: {
        velocityX: -2,
        gravity: 0.5,
        velocityY: -6,
        pipeInterval: 1500 // 1.5 segundos
    }
}

const mediumDif = {
    medium: {
        velocityX: -4,
        gravity: 0.7,
        velocityY: -8,
        pipeInterval: 800 // 0.8 segundos
    }
}

const hardDif = {
    hard: {
        velocityX: -8,
        gravity: 0.8,
        velocityY: -8,
        pipeInterval: 600 // 0.6 segundos
    }
}

const professionalDif = {
    professional: {
        velocityX: -11,
        gravity: 1.1,
        velocityY: -9,
        pipeInterval: 450 //0.45 segundos
    }
}

// Recupera o parâmetro de dificuldade da URL
const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty');

// Define e armazena as configurações com base na dificuldade
let settings; 
if (difficulty === "easy") {
    settings = easyDif.easy;
} else if (difficulty === "medium") {
    settings = mediumDif.medium;
} else if (difficulty === "hard") {
    settings = hardDif.hard;
} else if (difficulty === "professional") {
    settings = professionalDif.professional;
}

// Usa as configurações em settings para utilizar no jogo
let { velocityX, gravity, velocityY } = settings;

let gameOver = false; // Variável, pois ela deverá mudar para determinar o fim do jogo
let score = 0; // Variável, pois a pontuação muda a repetidamente

// Responsável pelo carregamento e renderização das imagens do jogo
const imgLoad = () => {
    board = document.getElementById("board");
    board.height = 860;
    board.width = 1920;
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

// Executa a função imgLoad, quando a página HTML estiver carregada
window.onload = imgLoad;

/* Principal função do jogo, responsável por: simular a sensação de gravidade, o limite superior da tela, verifica se o mesmo caiu da tela, atualiza a imagem do pássaro e do tubo*/
const update = () => {
    setTimeout(update, 1000 / 60); // Chamará a função novamente a cada 1/60 segundos

    // Chama o restartGame imediatamente quando o jogo terminar
    if (gameOver) {
        restartGame(); 
    }

    // função base, na qual se gameOver verdadeira, nada acontece
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
    context.font = "45px Helvetica";
    context.fillText(`Score: ${score}`, 5, 45);
}

// Responsável por criar os canos de cima e de baixo no jogo
const placePipes = () => { 
    if (gameOver) { // função base, na qual se gameOver verdadeira, nada acontece
        return;
    }

    // Cálculo aleatório da posição dos tubos, mantendo uma abertura entre o tubo superior e inferior
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
        velocityY = settings.velocityY;
    }
}

// Detectará se as extremidades do pássaro se encostam com a o tubo, por exemplo, se a parte de cima do pássaro encosta no parte inferior do tubo
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

//Função que permite que as teclas espaço e seta pra cima sejam executadas e bloqueia qualquer outra tecla a não ser elas duas
const blocking_keys = () => {document.addEventListener('keydown', function(event) {
    const Keys = [' ', 'ArrowUp']
    if (!Keys.includes(event.key)) {
        event.preventDefault()
    }
})}

blocking_keys();
