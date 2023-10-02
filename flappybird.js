//board-> Todo esse bloco irá receber dados sobre o "quadro" do jogo
//Decidir deixar a variável no board, pois é onde o jogo será exibido então não tem como deixar como const
let board;
//Dimensões do jogo
const boardWidth = 1366;
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
    img.onload = function() {
        context.drawImage(img, bird.x, bird.y, bird.width, bird.height);
    }
}

//Carrega a imagem do passaro
let birdImg = new Image()
birdImg.src = "./flappybird.png"
//Chamada da função
birdImage(birdImg)

//pipes
//Uma array que irá receber os canos (obstáculo do jogo)
let pipeArray = [];
//Dimensões do cano
const pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
const pipeHeight = 512;
//Coordenadas iniciais do cano
const pipeX = boardWidth / 1.28;
const pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
const velocityX = -2; //pipes moving left speed
const gravity = 0.4;
let velocityY = 0; //bird jump speed

let gameOver = false;
let score = 0; // A pontuação varia a todo momento

window.onload = function() {
    board = document.getElementById("board");
    board.height = 640;
    board.width = 1000;
     context = board.getContext("2d");

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

function update() {
    setTimeout(update, 1000 / 60); // Isso limita a taxa de quadros para cerca de 60 FPS;
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

const moveBird = (e) => {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

const detectCollision = (a, b) => {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
