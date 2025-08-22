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
    let player = 'empty';
    const getPlayer = () => player;
    const setPlayer = (playerID) => {
        player = playerID;
    };
    const reset = () => {
        player = 'empty';
    };
    return { getPlayer, setPlayer, reset };
};

const createPlayer = function (name) {
    let playerName = name || 'empty';
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
            console.log(`row index is ${row}`);
            if (row[rowIndex] > maxTileCount) {
                maxTileCount = row[rowIndex];
            }
        }
    };

    const incrementColCount = (colIndex) => {
        if (col != null) {
            col[colIndex]++;
            console.log(`col index is ${col}`);
            if (col[colIndex] > maxTileCount) {
                maxTileCount = col[colIndex];
            }
        }
    };

    let diagonal = 0;
    const incrementDiagonal = () => {
        diagonal++;
        console.log(`diagonal index is ${diagonal}`);
        if (diagonal > maxTileCount) {
            maxTileCount = diagonal;
        }
    };

    let antiDiagonal = 0;
    const incrementAntiDiagonal = () => {
        antiDiagonal++;
        console.log(`diagonal index is ${antiDiagonal}`);
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

const createPlayerManager = (name) => {
    let player = createPlayer(name);
    let playerPointManager = createPointTracker();
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

const gameModule = (function () {
    const gameStatus = {
        ONGOING: 'ONGOING',
        WIN: 'WIN',
        TIE: 'TIE'
    }

    let players = [];

    const addPlayer = () => {
        const playerNumber = players.length + 1;
        players.push(createPlayerManager(`${playerNumber}`));
    }

    let player1 = createPlayerManager('1');
    let player2 = createPlayerManager('2');
    let currentPlayer = player1;
    let currStatus = gameStatus.ONGOING;

    let GAME_DIMENSION = 3;
    let pointsRequired = GAME_DIMENSION;

    let board = createGameBoard(GAME_DIMENSION);

    let markedTiles = 0;
    const placeSymbol = function (row, col) {
        const currTile = board.getTile(row, col);
        if (currTile.getPlayer() === 'empty') {
            currTile.setPlayer(currentPlayer.getName());
            markedTiles++;
            console.log(`${currentPlayer.getName()} placed a tile at ${row}, ${col}`);
            return true;
        }
        return false;
    };

    const nextPlayerTurn = function () {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const checkWin = (pointsRequired) => {
        return currentPlayer.getPoints() > (pointsRequired - 1);
    }

    const checkTie = () => {
        if (markedTiles == GAME_DIMENSION * GAME_DIMENSION) {
            return true;
        }
        return false;
    }

    const playRound = function (row, col) {
        if (placeSymbol(row, col)) {
            currentPlayer.updatePoints(row, col, GAME_DIMENSION);
            if (checkWin(pointsRequired)) {
                console.log("someone won");
                reset();
            }
            if (checkTie()) {
                console.log("tie");
                reset();
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
        return gameStatus;
    }

    const reset = () => {
        player1.reset();
        player2.reset();
        currentPlayer = player1;
        markedTiles = 0;
        board.reset();
    }
    return { playRound, getCurrentPlayer, getGameStatus };
})();

const displayManager = (function () {

})();

gameModule.playRound(0, 2);
gameModule.playRound(0, 0);
gameModule.playRound(1, 1);
gameModule.playRound(0, 1);
gameModule.playRound(2, 0);


