const createGameBoard = function createGameBoard(dimension = 3) {
    const NUM_ROWS = dimension;
    const rows = [];
    for (let i = 0; i < NUM_ROWS; i++) {
        rows.push([]);
        for (let j = 0; j < NUM_ROWS; j++) {
            rows[i].push(createTile());
        }
    }

    const getTile = (row, col) => {
        return rows[row][col];
    };

    const reset = () => {
        for (let row = 0; row < NUM_ROWS; row++) {
            for (let col = 0; col < NUM_ROWS; col++) {
                rows[row][col].reset();
            }
        }
    };

    const getDimension = () => {
        return NUM_ROWS;
    }

    //for testing
    const printBoard = () => {
        let boardString = '';
        for (const arr of rows) {
            for (const tile of arr) {
                boardString = boardString.concat(`[${tile.getPlayerID()}]`);
            }
            boardString = boardString.concat('\n');
        }
    }

    return { getTile, reset, getDimension, printBoard };
};

const createTile = () => {
    let player = 'unmarked';
    const getPlayerID = () => `${player}`;
    const setPlayerID = (playerID) => {
        player = playerID;
    };
    const reset = () => {
        player = 'unmarked';
    };
    return { getPlayerID, setPlayerID, reset };
};

const createPlayer = function (playerID) {
    let playerName = 'unnamed';
    const id = playerID;
    const getName = () => playerName;
    const getID = () => id;
    const setName = (givenName) => {
        playerName = givenName;
    };
    return { getName, setName, getID };
};

/*
*   The point tracker tracks a single player's number of placed tiles
*   per row or column.
*   It uses two arrays and two integers to track how many tiles have
*   been placed in a given row, column, or diagonal line. This allows
*   for fast win checks.
*   It tracks which row, column, or diagonal has the highest number
*   of placed tiles.
*/
const createPointTracker = (dimension) => {
    let maxTileCount = 0;
    const row = new Int16Array(dimension);
    const col = new Int16Array(dimension);

    const incrementRowCount = (rowIndex) => {
        if (row != null) {
            row[rowIndex]++;
            if (row[rowIndex] > maxTileCount) {
                maxTileCount = row[rowIndex];
            }
        }
    };

    const incrementColCount = (colIndex) => {
        if (col != null) {
            col[colIndex]++;
            if (col[colIndex] > maxTileCount) {
                maxTileCount = col[colIndex];
            }
        }
    };

    let diagonal = 0;
    const incrementDiagonal = () => {
        diagonal++;
        if (diagonal > maxTileCount) {
            maxTileCount = diagonal;
        }
    };

    let antiDiagonal = 0;
    const incrementAntiDiagonal = () => {
        antiDiagonal++;
        if (antiDiagonal > maxTileCount) {
            maxTileCount = antiDiagonal;
        }
    }

    const getPoints = () => maxTileCount;

    const reset = () => {
        diagonal = 0;
        antiDiagonal = 0;
        maxTileCount = 0;
        row.fill(0);
        col.fill(0);
    }

    return {
        incrementRowCount, incrementColCount,
        incrementDiagonal, incrementAntiDiagonal, getPoints,
        reset
    };
};

const createPlayerManager = (ID, playerPointManager) => {
    let player = createPlayer(ID);

    const updatePoints = (row, col, gameDimension) => {
        playerPointManager.incrementRowCount(row);
        playerPointManager.incrementColCount(col);
        if (row === col) {
            playerPointManager.incrementDiagonal();
        }
        if ((row + col + 1) === gameDimension) {
            playerPointManager.incrementAntiDiagonal();
        }
    }

    const getPoints = () => {
        return playerPointManager.getPoints();
    }

    const getName = () => player.getName();

    const setName = (newName) => {
        player.setName(newName);
    }

    const reset = () => {
        playerPointManager.reset();
    }
    return { updatePoints, getName, getPoints, setName, reset }
}

const winManager = (function () {
    const playerScores = [0, 0];

    const incrementWins = (player) => {
        if (player === 0) {
            playerScores[0] += 1;
        } else if (player === 1) {
            playerScores[player] += 1;
        }
    }

    const getScore = (player) => {
        return playerScores[player];
    }

    const reset = () => { playerScores.fill(0); }
    return { incrementWins, getScore, reset };
})();

/*
* A heavily over-engineered game module that supports more than two players for essentially no reason whatsoever,
* just for sake of practicing thinking about how to make things more future proof
*/
const gameModule = (function () {
    const gameStatus = {
        ONGOING: 'ONGOING',
        WIN: 'WIN',
        TIE: 'TIE',
        STOPPED: 'STOPPED'
    }
    let gameDimension = 3;
    let currGameStatus = gameStatus.STOPPED;

    let players = [];
    const addPlayer = () => {
        const playerID = players.length;
        let newPlayer = createPlayerManager(`${playerID}`, createPointTracker(gameDimension))
        newPlayer.setName(`Player ${playerID + 1}`);
        players.push(newPlayer);
    }

    let numberOfPlayers = 2;
    const setNumberPlayers = (num) => {
        numberOfPlayers = num;
    }

    const createPlayerArray = (numPlayers = 2) => {
        for (let i = 0; i < numPlayers; i++) {
            addPlayer();
        }
        return players[0];
    };

    let currentPlayer = createPlayerArray(numberOfPlayers);
    let board = createGameBoard(gameDimension);

    let markedTiles = 0;
    const placeSymbol = function (row, col) {
        const currTile = board.getTile(row, col);
        if (currTile.getPlayerID() === 'unmarked') {
            currTile.setPlayerID(currPlayerIndex);
            markedTiles++;
            return true;
        }
        return false;
    };

    let currPlayerIndex = 0;
    const nextPlayerTurn = function () {
        currPlayerIndex = (currPlayerIndex + 1) % players.length;
        currentPlayer = players[currPlayerIndex];
    };

    let pointsRequired = gameDimension;
    const checkWin = (pointsRequired) => {
        return currentPlayer.getPoints() > (pointsRequired - 1);
    }

    const checkTie = () => {
        if (markedTiles == gameDimension * gameDimension) {
            return true;
        }
        return false;
    }

    const playRound = function (row, col) {
        if (placeSymbol(row, col)) {
            currentPlayer.updatePoints(row, col, gameDimension);
            if (checkWin(pointsRequired)) {
                winManager.incrementWins(currPlayerIndex);
                currGameStatus = gameStatus.WIN;
            }
            else if (checkTie()) {
                currGameStatus = gameStatus.TIE;
            } else {
                nextPlayerTurn();
            }
        }
        board.printBoard();
    };

    const getCurrentPlayer = () => {
        return currentPlayer;
    }

    const getCurrentPlayerIndex = () => {
        return currPlayerIndex;
    }

    const getGameStatus = () => {
        return currGameStatus;
    }

    const getGameBoard = () => {
        return board;
    }

    const getDimension = () => {
        return gameDimension;
    }

    const setPlayerNames = (name1, name2) => {
        if (players.length >= 2) {
            players[0].setName(name1 || 'Player 1');
            players[1].setName(name2 || 'Player 2');
        }
    };

    const reset = () => {
        for (let i = 0; i < players.length; i++) {
            players[i].reset();
        }
        currentPlayer = players[0];
        markedTiles = 0;
        board.reset();
        currGameStatus = gameStatus.STOPPED;
        currPlayerIndex = 0;
    };

    const start = () => {
        if (currGameStatus === gameStatus.STOPPED) {
            currGameStatus = gameStatus.ONGOING;
        }
    };

    return { playRound, getCurrentPlayer, getGameStatus, getGameBoard, getDimension, getCurrentPlayerIndex, start, setPlayerNames, reset };
})();

const displayManager = (function () {
    const doc = document;
    const gameWindow = doc.querySelector('.game-window');
    const dim = gameModule.getDimension();

    const buildCell = () => {
        const tile = doc.createElement('div');
        tile.classList.add('cell');
        return tile;
    };

    const playerScores = doc.querySelectorAll('.player-stats');
    const playerCards = doc.querySelectorAll('.player-container');
    const updateDisplay = () => {
        let tiles = doc.querySelectorAll('.cell');
        tiles.forEach(element => {
            const tile = gameModule.getGameBoard().getTile(element.dataset.row, element.dataset.col);
            if (tile.getPlayerID() === '0') {
                element.textContent = 'X';
            } else if (tile.getPlayerID() == '1') {
                element.textContent = 'O';
            } else {
                element.textContent = '';
            }
        });

        playerScores.forEach(element => {
            if (element.dataset.player === '0') {
                element.textContent = winManager.getScore(0);
            } else if (element.dataset.player === '1') {
                element.textContent = winManager.getScore(1);
            }
        });

        let currStatus = gameModule.getGameStatus();
        if (currStatus === 'ONGOING') {
            if (gameModule.getCurrentPlayerIndex() === 0) {
                playerCards[0].classList.add('name-highlight');
                playerCards[1].classList.remove('name-highlight');
            } else if (gameModule.getCurrentPlayerIndex() === 1) {
                playerCards[1].classList.add('name-highlight');
                playerCards[0].classList.remove('name-highlight');
            }
        } else if (currStatus === 'WIN' || currStatus === 'TIE' || currStatus === 'STOPPED') {
            playerCards[0].classList.remove('name-highlight');
            playerCards[1].classList.remove('name-highlight');
        }
    };

    const buildGrid = () => {
        let tile = null;
        for (let i = 0; i < dim * dim; i++) {
            const row = Math.floor(i / dim);
            const col = i % dim;
            tile = buildCell();
            tile.dataset.row = row;
            tile.dataset.col = col;
            gameWindow.appendChild(tile);
            tile.addEventListener('click', () => {
                if (gameModule.getGameStatus() === 'ONGOING') {
                    gameModule.playRound(row, col);
                    if (gameModule.getGameStatus() === 'WIN') {
                        updateDisplay();
                        displayMessage(`${gameModule.getCurrentPlayer().getName()} won!`);
                    }
                }
                updateDisplay();
            });
        }
    };

    const resetButton = doc.querySelector('.reset-button');
    const resetDisplay = () => {
        displayMessage('Game reset!\r\nPress start to play!');
        for (const tile of gameWindow.children) {
            tile.textContent = '';
        }
    }

    resetButton.addEventListener('click', () => {
        resetDisplay();
        gameModule.reset();
        updateDisplay();
    });

    const startButton = doc.querySelector('.start-button');
    startButton.addEventListener('click', () => {
        gameModule.start();
        displayMessage('Game started!');
        updateDisplay();
    });

    const messageArea = doc.querySelector('.message-container');
    const displayMessage = (message) => {
        messageArea.textContent = message;
    };


    const playerNames = doc.querySelectorAll('.player-name-display');
    const player1NameText = doc.querySelector('#player1-name');
    const player2NameText = doc.querySelector('#player2-name');
    const submitButton = doc.querySelector('.submit-button');
    const submitNames = () => {
        const player1Name = player1NameText.value ? player1NameText.value : 'Player X';
        const player2Name = player2NameText.value ? player2NameText.value : 'Player O';
        gameModule.setPlayerNames(player1Name, player2Name);
        playerNames[0].textContent = player1Name;
        playerNames[1].textContent = player2Name;
    }

    submitButton.addEventListener('click', () => {
        submitNames();
    });

    buildGrid();
})();


