//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 34;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

//audio
let bgMusic;
let gameOverSound;
let jumpSound;

let gameStarted = false; // has the user started the game?

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load images
    birdImg = new Image();
    birdImg.src = "./media/images/snehal.jpeg";

    topPipeImg = new Image();
    topPipeImg.src = "./media/images/pillerTop.jpeg";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./media/images/pillerBottom.jpeg";

    //load audio
    bgMusic = new Audio("./media/audio/song.m4a");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;

    gameOverSound = new Audio("./media/audio/laparwahi.m4a");
    gameOverSound.volume = 0.6;

    // Optional short sound when bird jumps
    jumpSound = new Audio("./media/audio/jump.m4a");
    jumpSound.volume = 0.6;

    // Draw the initial bird (before game starts)
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        context.fillStyle = "white";
        context.font = "25px sans-serif";
        context.fillText("Tap to Start!", 90, 320);
    };

    // First tap or key starts the game
    document.addEventListener("touchstart", startGame, { passive: false });
    document.addEventListener("mousedown", startGame);
    document.addEventListener("keydown", startGame);
};

function startGame(e) {
    // Prevent scroll/tap delay
    if (e.cancelable) e.preventDefault();

    // Start for the first time
    if (!gameStarted) {
        gameStarted = true;
        bgMusic.play().catch(() => {
            console.log("Waiting for user interaction to play audio...");
        });
        requestAnimationFrame(update);
        setInterval(placePipes, 1500);
    }

    // If game is over → restart fully
    if (gameOver) {
        resetGame();
        return;
    }

    // Jump (normal case)
    velocityY = -5;
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
}

// 🧠 NEW: Proper reset function (fixes your issue)
function resetGame() {
    // Reset bird position and velocity
    bird.y = birdY;
    velocityY = 0;

    // Clear pipes and reset score
    pipeArray = [];
    score = 0;
    gameOver = false;

    // Restart music
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});

    // Give a tiny upward jump immediately so the bird doesn't fall
    velocityY = -5;
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
}

function update() {
    requestAnimationFrame(update);
    if (!gameStarted || gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    //bird physics
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        endGame();
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            endGame();
        }
    }

    //remove off-screen pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    //score display
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver || !gameStarted) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 3;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    pipeArray.push(bottomPipe);
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function endGame() {
    if (!gameOver) {
        gameOver = true;
        bgMusic.pause();
        gameOverSound.play().catch(() => {});
    }
}
