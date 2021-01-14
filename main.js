// -If you only ever need ONE of something (gameBoard, displayController), use a module. If you need multiples of something (players!), create them with factories.

const players = (player) => {
  if (player === "player1") {
    return {
      name: document.getElementById("x").value,
      symbol: "X",
      type: document.querySelector('input[name="player-type-1"]:checked').value,
    };
  }
  if (player === "player2") {
    return {
      name: document.getElementById("o").value,
      symbol: "O",
      type: document.querySelector('input[name="player-type-2"]:checked').value,
    };
  }
};

const display = (() => {
  const board = document.querySelector(".board");
  const again = document.querySelector(".btn--again");
  const restart = document.querySelector(".btn--restart");
  const gameOver = document.querySelector(".game-over");
  const winner = document.querySelector(".winner");
  const start = document.querySelector(".btn--start");
  const form = document.querySelector(".name-form");
  return {
    board,
    again,
    restart,
    gameOver,
    winner,
    start,
    form,
  };
})();

const gameBoard = (() => {
  let items = ["", "", "", "", "", "", "", "", ""];

  const render = () => {
    display.board.innerHTML = "";
    items.map((el, idx) => {
      const boardElement = document.createElement("div");
      boardElement.classList.add("board__tile");
      boardElement.innerHTML = el;
      boardElement.dataset.tile = idx;
      display.board.append(boardElement);
    });
  };
  const input = (e, player) => {
    const el = e.target.dataset.tile;
    if (!items[el] && el) {
      items[el] = player.symbol;
      render();
      return true;
    }
  };
  const inputComputer = (player) => {
    // get a random location in the array
    const generateRandom = () => Math.floor(Math.random() * items.length);
    let random = generateRandom();
    let randomArrIdx = items[random];
    // check if the location is empty
    while (randomArrIdx !== "") {
      random = generateRandom();
      randomArrIdx = items[random];
    }
    // insert players symbol in tha location
    items[random] = player.symbol;
    // render updated board
    render();
  };
  const showWinner = (winner) => {
    display.gameOver.style.display = "block";
    display.winner.textContent = `Congratulations ${winner}, you WON 🎉`;
  };
  const isBoardFull = () => {
    return !items.includes("");
  };
  const showTie = () => {
    display.gameOver.style.display = "block";
    display.winner.textContent = `It's a TIE 😬`;
  };
  const checkBoard = (arr, symbol) => {
    return (
      items[arr[0]] === symbol &&
      items[arr[1]] === symbol &&
      items[arr[2]] === symbol
    );
  };
  const reset = () => {
    display.board.innerHTML = "";
    items = ["", "", "", "", "", "", "", "", ""];
    display.gameOver.style.display = "none";
    display.winner.textContent = "";
  };
  return {
    render,
    input,
    inputComputer,
    showWinner,
    showTie,
    isBoardFull,
    reset,
    checkBoard,
  };
})();

const game = (() => {
  let player1 = {};
  let player2 = {};
  let player, winner;

  const init = (e) => {
    e.preventDefault();
    player1 = players("player1");
    player2 = players("player2");
    display.form.style.display = "none";
    gameBoard.render();
    player = player1;
    display.board.addEventListener("click", play);
  };

  const gameOver = (type) => {
    if (type === "tie") {
      display.board.removeEventListener("click", play);
      gameBoard.showTie();
    } else {
      display.board.removeEventListener("click", play);
      gameBoard.showWinner(winner);
    }
  };
  const checkWinner = ({ name, symbol }) => {
    const winningArr = [
      // ["X", "X", "X", "", "", "", "", "", ""]
      [0, 1, 2],
      // ["", "", "", "X", "X", "X", "", "", ""]
      [3, 4, 5],
      // ["", "", "", "", "", "", "X", "X", "X"]
      [6, 7, 8],
      // ["X", "", "", "X", "", "", "X", "", ""]
      [0, 3, 6],
      // ["", "X", "", "", "X", "", "", "X", ""]
      [1, 4, 7],
      // ["", "", "X", "", "", "X", "", "", "X"]
      [2, 5, 8],
      // ["X", "", "", "", "X", "", "", "", "X"]
      [0, 4, 8],
      // ["", "", "X", "", "X", "", "X", "", ""]
      [2, 4, 6],
    ];

    return winningArr.some((arr) => {
      if (gameBoard.checkBoard(arr, symbol)) return (winner = name);
    });
  };
  const switchPlayer = (currentPlayer) => {
    return currentPlayer === player1 ? (player = player2) : (player = player1);
  };
  const play = (e) => {
    // person takes turn
    if (gameBoard.input(e, player)) {
      if (checkWinner(player)) return gameOver();
      if (gameBoard.isBoardFull() && !winner) return gameOver("tie");
      switchPlayer(player);
    }
    // and then computer responds
    if (player === player2 && player2.type === "computer" && !winner) {
      gameBoard.inputComputer(player);
      if (checkWinner(player)) gameOver();
      if (gameBoard.isBoardFull()) {
        gameOver("tie");
      }
      switchPlayer(player);
    }
  };
  const playAgain = (e) => {
    player = player1;
    winner = null;
    gameBoard.reset();
    init(e);
  };
  const restart = () => {
    location.reload();
    return false;
  };
  return { init, playAgain, restart };
})();

display.start.addEventListener("click", game.init);
display.again.addEventListener("click", game.playAgain);
display.restart.addEventListener("click", game.restart);

/* 
Check out this tut https://www.freecodecamp.org/news/how-to-make-your-tic-tac-toe-game-unbeatable-by-using-the-minimax-algorithm-9d690bad4b37/
1. The minimax needs to get the current state of the board
2. Check for terminal state - if there's a winner or a tie
3. Loop through available spots
4. Using recursion we call the minimax function again and place the symbol again
5. Reuccrusion will be broken by terminal state and returns a value of this path
*/
