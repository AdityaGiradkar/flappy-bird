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

let gameStarted = false; // to track if first user interaction happened

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load images
    birdImg = new Image();
    birdImg.src = "./media/images/snehal.jpeg";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./media/images/pillerTop.jpeg";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./media/images/pillerBottom.jpeg";

    //load audio files
    bgMusic = new Audio("./media/audio/song.m4a");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;

    gameOverSound = new Audio("./media/audio/laparwahi.m4a");
    gameOverSound.volume = 0.6;

    // Request animation & setup
    requestAnimationFrame(update);
    setInterval(placePipes, 1500);

    // Keyboard controls (desktop)
    document.addEventListener("keydown", moveBird);

    // Touch controls (mobile)
    board.addEventListener("touchstart", handleTouch);
    document.addEventListener("click", handleTouch); // fallback for desktop clicks
};

function handleTouch() {
    // Start background music (needed for mobile browsers)
    if (!gameStarted) {
        gameStarted = true;
        bgMusic.play().catch(() => {
            console.log("Audio play blocked until user interacts again.");
        });
    }

    // Make the bird jump
    velocityY = -5;

    // Reset game if over
    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        bgMusic.currentTime = 0;
        bgMusic.play();
    }
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    //bird
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

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) return;

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

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        handleTouch(); // reuse same logic for jump
    }
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
        gameOverSound.play();
    }
}
