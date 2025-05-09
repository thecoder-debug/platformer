const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let player = {
    x: 100,
    y: 200,
    width: 25,
    height: 25,
    vy: 0,
    onGround: false,
    angle: 0
};

let levelObjects = [];
let floorHeight = HEIGHT / 5;
let lastFloorY = HEIGHT - floorHeight;
let moveSpeed = 5;
let gravityForce = 1.5;
let jumpForce = -15;

let levelX = 0;
let lastSpikeX = 0;
let gameOver = false;
let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (gameOver && e.code === "KeyR") restartGame();
});
document.addEventListener("keyup", (e) => keys[e.code] = false);

function createFloor(y, startX) {
    levelObjects.push({ type: "floor", x: startX, y: y, width: WIDTH, height: floorHeight });
}

function createObstacle(x, y, width, height) {
    levelObjects.push({ type: "obstacle", x, y, width, height });
}

function updatePlayer() {
    if (!player.onGround) {
        player.vy += gravityForce;
    }

    player.y += player.vy;
    player.onGround = false;

    for (let obj of levelObjects) {
        if (obj.type === "floor") {
            if (
                player.y + player.height >= obj.y &&
                player.y + player.height <= obj.y + 5 &&
                player.x + player.width > obj.x &&
                player.x < obj.x + obj.width
            ) {
                player.y = obj.y - player.height;
                player.vy = 0;
                player.onGround = true;
                player.angle = 0;
            }
        }
    }

    if (!player.onGround) {
        player.angle += 10;
    } else {
        player.angle = 0;
    }

    if (keys["Space"] && player.onGround) {
        player.vy = jumpForce;
        player.onGround = false;
    }
}

function checkCollisions() {
    for (let obj of levelObjects) {
        if (obj.type === "obstacle") {
            if (
                player.x < obj.x + obj.width &&
                player.x + player.width > obj.x &&
                player.y < obj.y + obj.height &&
                player.y + player.height > obj.y
            ) {
                gameOver = true;
            }
        }
    }
}

function updateLevel() {
    for (let obj of levelObjects) {
        obj.x -= moveSpeed;
    }

    levelObjects = levelObjects.filter(obj => obj.x + obj.width > 0);

    const lastFloor = levelObjects.filter(o => o.type === "floor").slice(-1)[0];
    levelX += moveSpeed;

    if (lastFloor && lastFloor.x + lastFloor.width < WIDTH) {
        let offset = Math.floor(Math.random() * 70 - 20);
        let newY = Math.min(HEIGHT - floorHeight, Math.max(HEIGHT / 2, lastFloorY - offset));
        createFloor(newY, WIDTH);
        lastFloorY = newY;
    }

    if (levelX - lastSpikeX >= 400 && Math.random() < 0.2) {
        let count = Math.floor(Math.random() * 3) + 1;
        let spikeWidth = 40;
        let spikeHeight = 40;
        let baseY = lastFloorY - spikeHeight;
        for (let i = 0; i < count; i++) {
            createObstacle(WIDTH + i * spikeWidth, baseY, spikeWidth, spikeHeight);
        }
        lastSpikeX = levelX;
    }
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate((player.angle * Math.PI) / 180);
    ctx.fillStyle = "blue";
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}

function drawLevel() {
    for (let obj of levelObjects) {
        if (obj.type === "floor") {
            ctx.fillStyle = "gray";
        } else if (obj.type === "obstacle") {
            ctx.fillStyle = "red";
        }
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawLevel();
    drawPlayer();

    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("Game Over! Press 'R' to restart.", 120, HEIGHT / 2);
    }
}

function loop() {
    if (!gameOver) {
        updatePlayer();
        updateLevel();
        checkCollisions();
    }
    draw();
    requestAnimationFrame(loop);
}

function restartGame() {
    player.x = 100;
    player.y = 200;
    player.vy = 0;
    player.onGround = false;
    levelObjects = [];
    lastSpikeX = 0;
    levelX = 0;
    lastFloorY = HEIGHT - floorHeight;
    gameOver = false;
    createFloor(lastFloorY, 0);
}

function startGame() {
    createFloor(lastFloorY, 0);
    loop();
}

startGame();
