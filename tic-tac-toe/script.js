let boxes = document.querySelectorAll(".box");
let resetbtn = document.querySelector("#reset-btn");

let player = true;  // true = Human (O), false = Computer (X)
let gameOver = false;

const winPatterns = [
    [0,1,2], [0,3,6], [0,4,8], [1,4,7], 
    [2,5,8], [2,4,6], [3,4,5], [6,7,8]
];

// Function to Change Color
const changeColor = (box) => {
    box.style.color = box.innerText === "O" ? "green" : "red";
}

// Function to Reset the Game
const resetGame = () => {
    player = true;
    gameOver = false;
    boxes.forEach(box => {
        box.innerText = "";
        box.style.color = "black";
    });
}

// Function to Check Winner
const checkWinner = () => {
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        let val1 = boxes[a].innerText;
        let val2 = boxes[b].innerText;
        let val3 = boxes[c].innerText;

        if (val1 !== "" && val1 === val2 && val2 === val3) {
            gameOver = true;
            setTimeout(() => {
                alert(`🎉 Player ${val1} Wins!`);
            }, 100);
            return true;
        }
    }
    return false;
}

// Function to Check Draw
const checkDraw = () => {
    let isDraw = [...boxes].every(box => box.innerText !== "");
    if (isDraw && !gameOver) {
        gameOver = true;
        setTimeout(() => {
            alert("🤝 Match Draw!");
            resetGame();
        }, 100);
    }
}

// ✅ Simple AI - Computer Moves Randomly
const computerMove = () => {
    if (gameOver) return;

    let emptyBoxes = [...boxes].filter(box => box.innerText === "");
    if (emptyBoxes.length > 0) {
        let randomBox = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
        randomBox.innerText = "X";
        changeColor(randomBox);
        player = true; // Switch back to human

        if (!checkWinner()) {
            checkDraw();
        }
    }
}

// Handle Click Event for Human Player
boxes.forEach(box => {
    box.addEventListener("click", () => {
        if (!gameOver && box.innerText === "" && player) {
            box.innerText = "O";
            changeColor(box);
            player = false; // Switch to computer

            if (!checkWinner()) {
                checkDraw();
                setTimeout(computerMove, 500); // Computer plays after 500ms
            }
        }
    });
});


// Reset Button
resetbtn.addEventListener("click", resetGame);
