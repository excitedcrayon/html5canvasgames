window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

let gameScoreCounter = 0;
let gameOverState = false;

class Game {
    constructor(){
        this.restartButton = document.querySelector('button.restart');
        this.canvas = document.querySelector('#canvas');
        this.context = this.canvas.getContext('2d');
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.canvasBackgroundFillStyle = "#000";
        this.speed = 3.5;

        this.ballXPos = Math.floor( (Math.random() * (this.canvasWidth / 2) ) + ( this.canvasWidth * 0.1 ) );
        this.ballYPos = Math.floor( (Math.random() * (this.canvasHeight / 2) ) );


        this.ball = new Ball(
            this.context,
            this.ballXPos,
            this.ballYPos,
            10,
            this.speed,
            this.speed,
            0,
            2 * Math.PI,
            '#FFF'
        );

        this.paddleWidth = this.canvasWidth / 3;
        this.paddleHeight = 10;

        this.paddle = new Paddle(
            this.context,
            (this.canvasWidth / 2) - (this.paddleWidth / 2),
            this.canvasHeight - this.paddleHeight,
            this.paddleWidth,
            this.paddleHeight,
            "FFF",
            this.speed *= 50
        );

        this.gameOverAudio = new Audio('sfx/game-over.mp3');

        this.init();

    }
    init() {
        requestAnimationFrame(this.update);
        this.controller();
        this.restartGame();
    }
    background(){
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.context.fillStyle = this.canvasBackgroundFillStyle;
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    }
    gameScore(){
        this.context.font = "2rem Helvetica";
        this.context.fillStyle = "#FFF";
        let formattedScore = (gameScoreCounter < 10) ? `0${gameScoreCounter}` : gameScoreCounter;
        this.context.fillText(formattedScore, this.canvasWidth / 2 - 25, (16 * 2));

        if ( gameOverState ) {
            this.restartButton.style.opacity = 1;
        }
    }
    restartGame(){
        this.restartButton.addEventListener('click', () => {
            window.location.reload();
        });
    }
    controller(){
        window.addEventListener('keydown', (e) => {
            if (!gameOverState) {
                switch(e.key){
                    case "ArrowLeft":
                        this.paddle.movePaddleLeft(this.speed);
                        break;
                    case "ArrowRight":
                        this.paddle.movePaddleRight(this.speed);
                        break;
                }
            }
        });
    }
    update = () => {
        this.background();

        this.ball.drawBall();
        this.ball.collisionDetection(this.canvasWidth, this.canvasHeight, this.paddle);

        this.paddle.collisionDetection(this.canvasWidth);
        this.paddle.drawPaddle();

        this.gameScore();

        requestAnimationFrame(this.update);
    }
}

class Ball {
    constructor(context, x, y, size, speedX, speedY, startAngle, endAngle, color) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.color = color;

        this.ballAudio = new Audio('sfx/puck-hit.mp3');
    }
    drawBall(){
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.size, this.startAngle, this.endAngle);
        this.context.fillStyle = this.color;
        this.context.fill();

        this.bounceBall();
    }
    bounceBall(){
        this.x += this.speedX;
        this.y += this.speedY;
    }
    collisionDetection(canvasWidth, canvasHeight, paddle){

        if ( ( this.x + this.size ) >= canvasWidth || this.x - this.size <= 0 ) {
            this.speedX = -this.speedX;
        }

        if ( (this.y + this.size) >= canvasHeight ) {
            this.speedY = 0;
            this.speedX = 0;
            gameOverState = true;
        }

        if ( (this.y - this.size) <= 0 ) {
            this.speedY = -this.speedY;
            this.y = this.size;
        }

        // Check collision with the paddle
        if (
            this.x + this.size >= paddle.x && // Check right edge of ball
            this.x - this.size <= paddle.x + paddle.width && // Check left edge of ball
            this.y + this.size >= paddle.y // Check bottom edge of ball (top edge of paddle)
        ) {
            this.speedY = -this.speedY; // Reverse the vertical speed
            this.y = paddle.y - this.size; // Adjust position to prevent overlapping

            this.ballAudio.play();

            gameScoreCounter++;

            // increase speed every time you score 5 points
            if ( gameScoreCounter % 5 === 0 ) {

                this.speedX *= 1.1;
                this.speedY *= 1.1;
            }

            // stop score from incrementing
            if ( gameOverState ) {
                gameScoreCounter = gameScoreCounter;
            }
        }
        

    }
}

class Paddle {
    constructor(context, x, y, width, height, color, paddleSpeed){
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.paddleSpeed = paddleSpeed;
        this.lastUpdated = performance.now();
    }
    drawPaddle(){
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
    movePaddleLeft(){
        const now = performance.now();
        const elapsed = now - this.lastUpdated;
        this.x -= (this.paddleSpeed * elapsed) / 1000;
        this.lastUpdated = now;
    }
    movePaddleRight(){
        const now = performance.now();
        const elapsed = now - this.lastUpdated;
        this.x += (this.paddleSpeed * elapsed) / 1000;
        this.lastUpdated = now;
    }
    collisionDetection(canvasWidth){
        
        // check left hand collision
        if ( this.x < 0 ) {
            this.x = 0;
        } 

        // check right hand collision
        if ( ( this.x + this.width ) >= canvasWidth ) {
            this.x = ( canvasWidth - this.width );
        }
    }
}

class Audio {
    constructor(filePath){
        this.filePath = filePath;
        this.audioElement = document.createElement('audio');
        document.body.appendChild(this.audioElement);
        this.audioElement.setAttribute('src', this.filePath);
    }
    play(){
        this.audioElement.currentTime = 0;
        this.audioElement.play();
    }
}