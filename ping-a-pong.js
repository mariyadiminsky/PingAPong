/** Tips:
    *window.onload makes sure all code and graphics are loaded first before player can start game.
    *var canvasContext is where to draw graphics inside of the canvas.
    *addEventListener take events(already made like mousemove, mouseclick etc) and a function(declared or anonymous).
    *the fillStyle method sets or returns the color, gradient, or pattern used to fill the drawing.
    *fillRect method takes arguments. draws a filled rectangle. 0, 0 are x,y coordinates. They start at top left. x moves right, y moves down.
    *canvas.width and canvas.height is getting info from gameCanvas id.
    *Items drawn last overlap items before it.
    *const means the assigned value cannot be changed later.
    * object.fillText(text, X, Y). Inherits whatever color we are using.

** arc()
    * There is no circle function in HTML5. Use arc().
    * arc(X, Y, Radius/Size, Angle, Radians, whichSide).
    * In rectangle X and Y are in a TOPLEFT of the rectangle. In arc X and Y are in the CENTER of the circle.
    * If radius is 10, the circle will be 20pixels wide, 20pixels tall. Why? Diameter of circle=2r. So 10 * 2=20.
    * PI is half a circle. So 2PI is the entire circle. Can do Math.Pi/2 for kinda-pacman look.
    * True or False, depending what you pick will show one side of the circle and vice versa.
    * If Y and Radius is same number the ball will skim at the top. (ex) (ballx, 100, 100, 0 etc...)

*/

// START

// variables

var canvas;
var canvasContext;

var ballX = 50; // horizontal position of the ball.
var ballY = 50; // vertical position of the ball.
var ballXSpeed = 12;
var ballYSpeed = 7;

var paddleY1= 250; // top of the left paddle.
var paddleY2 = 250; // top of the right paddle.
const PADDLE_HEIGHT= 120;
const PADDLE_THICKNESS = 15;

var player1Score = 0;
var player2Score = 0;
const WINNER = 3; // score needed to win.
var winningScreen = false; // the screen after game wins. Set to false while game is playing.

// functions

// Loads canvas
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    // helps smoothen out moving objects(ball + paddles).
    var framesPerSecond = 30;
    setInterval(function() {
        graphicsMove();
        graphics();
    }, 1000/framesPerSecond);

    // Game restarts when mouse clicked
    canvas.addEventListener('mousedown', whenMouseClick);

    // Set paddle position value whenever mouse moves.
    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = calculateMousePos(evt);
        // calculates position of mouse on paddle. Divide PADDLE_HEIGHT by 2 to mouseover center of paddle.
        paddleY1 = mousePos.y - (PADDLE_HEIGHT/2);
    });
}

// Player can restart game after game ends with a click.
function whenMouseClick(evt) {
    if(winningScreen) {
        player1Score=0;
        player2Score=0;
        winningScreen =false;
    }
}

/**
    * Calculate Mouse Position.Gets mouse coordinates relative to an HTML5 Canvas.
    Returns the mouse coordinates based on the position of the client mouse and the position
    of the canvas obtained from the getBoundingClientRect() method of the window object.
*/
function calculateMousePos(evt) {

    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x:mouseX,
        y:mouseY
    };
}

/*
    * Resets the ball in the center of the screen if either player gets a point.
    * Winning screen if either player wins.
*/
function ballReset() {
    if(player1Score>=WINNER || player2Score>=WINNER) {
        winningScreen = true;
    }


    // ball goes opposite direction when reset. This means -1, -2, -3 etc. so multiply - times - equals + (example)= -(1)=1.
    ballXSpeed = -ballXSpeed;
    ballX = canvas.width/2;
    ballY = canvas.height/2;

}

// Computer paddle following ball's vertical position.
function computerMove() {
    // Line up Computer's center to ball(since X and Y start in center in arc, for the ball).
    var paddleY2Center = paddleY2 + (PADDLE_HEIGHT/2);

    /*
        * If center of paddle is higher than ball's vertical position, move down.
        (ex) paddleY2Center(300) < ballY(350). ballY position is lower on Y axis. Thus paddle must go down.
        * To smoothen out Computer paddle movement, I subtracted 35pixels from ballY so the Computer doesn't chase the ball when it doesn't need to.
    */
    if(paddleY2Center < ballY -45) {
        paddleY2+=10; // moves paddle down
    } else if(paddleY2Center > ballY +45) {
        paddleY2-=10;// moves paddle up
    }
}

// Movement of ball, paddle, Computer.
function graphicsMove() {
    if(winningScreen) {
        return; // everything after this will stop because of the return, due to someone winning.
    }

    computerMove();

    // Speed of ball horizontally and vertically.
    ballX = ballX + ballXSpeed;
    ballY = ballY + ballYSpeed;

    // Ball bounces between the right and left walls.
    // Right paddle
    if(ballX > canvas.width) {
        /*
            * Bounce ball back from paddle.
            * If the ball is lower than the top of the paddle(since number in Y axis is greater) AND the ball
            is in between the height of the paddle then it must within the paddle.
            Since the ball is on the paddle, bounce the ball back.
            Otherwise, if the ball is not on the paddle, it must be on the right wall.
            Reset it and give Player 1 a point.
        */
        if(ballY > paddleY2 &&
           ballY < paddleY2 + PADDLE_HEIGHT) {
                ballXSpeed = -ballXSpeed;

                /*
                    * Control ball movement (straight/diagonal) based on where it lands.
                    * Because ball is not always in center when it hits, this will return
                    a + or - value depending on if the ball is on the higher half or lower half of the paddle.
                */
                var diffY = ballY - (paddleY2 + PADDLE_HEIGHT/2); // center of the ball - center of the paddle.
                ballYSpeed = diffY * 0.25; // 0.25 because by itself diffY will make the ball burst up and down diagnolly. Soften that up.
        } else {
            player1Score ++; // must be BEFORE ballReset().
            ballReset();
        }

        // Left paddle
    } else if(ballX < 0) {
        if(ballY > paddleY1 &&
           ballY < paddleY1 + PADDLE_HEIGHT) {
                ballXSpeed = -ballXSpeed;

                var diffY = ballY - (paddleY1 + PADDLE_HEIGHT/2);
                ballYSpeed = diffY * 0.25;
        } else {
            player2Score ++;
            ballReset();
        }
    }

    // Ball bounces between top and bottom walls.
    if(ballY > canvas.height) {
        ballYSpeed = -ballYSpeed;
    } else if(ballY < 0) {
        ballYSpeed = -ballYSpeed;
    }
}

// Graphics in game; ball, paddle, net, the score and the winning screen info.
function graphics() {
    // the winning screen
    graphicsClass(0, 0, canvas.width, canvas.height, '#7f4bd1');

    if(winningScreen) {
        canvasContext.fillStyle = 'white'

        if(player1Score>=WINNER) {
            canvasContext.font = "bold 21px sans-serif";
            canvasContext.fillText("YOU WON!!", canvas.width-470, canvas.height-350);
            canvasContext.font = "12px sans-serif";
            canvasContext.fillText("Click to Continue", canvas.width-445, canvas.height-150)
        } else if(player2Score>=WINNER) {
            canvasContext.font = "bold 24px sans-serif";
            canvasContext.fillText("The Computer Won!", canvas.width-530, canvas.height -350);
            canvasContext.font = "12px sans-serif";
            canvasContext.fillText("Click to Continue", canvas.width-455, canvas.height-150)
        }
        return;
    }

    pingPongNet();

    // the left paddle.
    graphicsClass(0, paddleY1, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white');

    // the right(computer) paddle.
    graphicsClass(canvas.width-PADDLE_THICKNESS, paddleY2, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white');

    // the ball.
    drawTheBall(ballX, ballY, 10, '#ffff00');

    // Keep Score.
    canvasContext.font = "bold 36px sans-serif";
    canvasContext.fillStyle='white';
    canvasContext.fillText(player1Score, 250, canvas.height-450); // displays on left screen;
    canvasContext.fillText(player2Score, canvas.width -250, canvas.height-450); // displays on right screen;
}

// function class for graphics, since multiple graphics will be created. Can be created after graphics() since it's a declared function.
function graphicsClass(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX,topY,width, height);
}

// function class for the ball drawing, just so it looks better in graphics().
function drawTheBall(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle=drawColor;
    canvasContext.beginPath(); // Defines a shape. We need this first to fill the circle.
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
    canvasContext.fill(); // Used with beginPath() and arc() to fill a circle. There is no fillArc, only fillRect.
}

// the net in between the game. Called in graphics().
function pingPongNet() {
    for(var i=0; i<=canvas.height; i+=39){ //space in between each "|"
        graphicsClass(canvas.width/2,i,3,20, 'white');
    }
}

// END
