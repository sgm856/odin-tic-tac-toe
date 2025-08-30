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
                boardString = boardString.concat(`[${tile.getPlayer()}]`);
            }
            boardString = boardString.concat('\n');
        }
        console.log(boardString);
    }

    return { getTile, reset, getDimension, printBoard };
};

const createTile = () => {
    let player = 'unmarked';
    const getPlayer = () => player;
    const setPlayer = (playerID) => {
        player = playerID;
    };
    const reset = () => {
        player = 'unmarked';
    };
    return { getPlayer, setPlayer, reset };
};

const createPlayer = function (name) {
    let playerName = name || 'unmarked';
    const getName = () => playerName;
    const setName = (givenName) => {
        playerName = givenName;
    };
    return { getName, setName };
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

const createPlayerManager = (name, playerPointManager) => {
    let player = createPlayer(name);

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

    const reset = () => {
        playerPointManager.reset();
    }
    return { updatePoints, getName, getPoints, reset }
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
        const playerNumber = players.length + 1;

        players.push(createPlayerManager(`${playerNumber}`, createPointTracker(gameDimension)));
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
        if (currTile.getPlayer() === 'unmarked') {
            currTile.setPlayer(currentPlayer.getName());
            markedTiles++;
            console.log(`${currentPlayer.getName()} placed a tile at ${row}, ${col}`);
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

    const getGameStatus = () => {
        return currGameStatus;
    }

    const getGameBoard = () => {
        return board;
    }

    const getDimension = () => {
        return gameDimension;
    }

    const reset = () => {
        for (let i = 0; i < players.length; i++) {
            players[i].reset();
        }
        currentPlayer = players[0];
        markedTiles = 0;
        board.reset();
        currGameStatus = gameStatus.STOPPED;
        currPlayerIndex = 0;
    }

    const start = () => {
        currGameStatus = gameStatus.ONGOING;
    }

    return { playRound, getCurrentPlayer, getGameStatus, getGameBoard, getDimension, start, reset };
})();

const displayManager = (function () {
    const doc = document;
    const gameWindow = doc.querySelector('.game-window');
    const dim = gameModule.getDimension();
    const playerScores = doc.querySelectorAll('.player-stats');

    const buildCell = () => {
        const tile = doc.createElement('div');
        tile.classList.add('cell');
        return tile;
    };

    const updateDisplay = () => {
        let tiles = doc.querySelectorAll('.cell');
        tiles.forEach(element => {
            const tile = gameModule.getGameBoard().getTile(element.dataset.row, element.dataset.col);
            if (tile.getPlayer() === '1') {
                element.textContent = 'X';
            } else if (tile.getPlayer() == '2') {
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
                    }
                }
                updateDisplay();
            });
        }
    };

    const resetButton = doc.querySelector('.reset');
    const resetDisplay = () => {
        for (const tile of gameWindow.children) {
            tile.textContent = '';
        }
    }

    resetButton.addEventListener('click', () => {
        resetDisplay();
        gameModule.reset();
    });

    const startButton = doc.querySelector('.start');
    startButton.addEventListener('click', () => {
        gameModule.start();
    });

    buildGrid();
    return {};
})();


