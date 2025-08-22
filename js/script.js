const gameBoard = function createGameBoard(dimension = 3) {
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
                rows[row[col]].reset();
            }
        }
    };

    const getDimension = () => {
        return NUM_ROWS;
    }
    return { getTile, reset, getDimension };
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

const createPointTracker = function {
    let dimension = 3;
    let max = 0;
    const initialize = function (dim = 3) {
        this.dimension = dim;
    };
    const row = new Int16Array(dimension);
    const col = new Int16Array(dimension);

    const incrementRowCount = (rowIndex) => {
        if (row != null) {
            row[rowIndex]++;
            if (row[rowIndex] > max) {
                max = row[rowIndex];
            }
        }
    };
    const incrementColCount = (colIndex) => {
        if (col != null) {
            col[colIndex]++;
            if (col[colIndex] > max) {
                max = col[colIndex];
            }
        }
    };

    let diagonal = 0;
    let antiDiagonal = 0;
    const incrementDiagonal = () => {
        diagonal++;
        if (diagonal > max) {
            max = diagonal;
        }
    };
    const incrementAntiDiagonal = () => {
        antiDiagonal++;
        if (antiDiagonal > max) {
            max = antiDiagonal;
        }
    }

    const getPoints = () => max;

    return {
        initialize, incrementRowCount, incrementColCount,
        incrementDiagonal, incrementAntiDiagonal, getPoints
    };
};

const createPlayerManager = (name) => {
    let player = createPlayer(name);
    let playerPointManager = createPointTracker();
    const updatePoints = (row, col) => {
        playerPointManager.incrementRowCount(row);
        playerPointManager.incrementColCount(col);
        if (row === col) {
            playerPointManager.incrementDiagonal();
        }
        if ((row + col) === gameDimension) {
            playerPointManager.incrementAntiDiagonal();
        }
    }

    const getPoints = () => {
        return playerPointManager.getPoints();
    }

    const getName = player.getName();
    return { updatePoints, getName, getPoints }
}

const gameModule = (function () {
    let player1 = createPlayerManager('1');
    let player2 = createPlayerManager('2');
    let currentPlayer = player1;

    let GAME_DIMENSION = 3;
    let pointsRequired = GAME_DIMENSION;

    const board = createGameBoard(GAME_DIMENSION);

    const placeSymbol = function (row, col) {
        currTile = board.getTile(row, col);
        if (currTile.getName() === 'empty') {
            currTile.setPlayer(currentPlayer.getName());
            return true;
        }
        return false;
    };

    const nextPlayerTurn = function () {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const checkWin = (points, pointsRequired) => {
        return currentPlayer.getPoints() > (pointsRequired - 1);
    }

    const playRound = function (row, col) {
        if (placeSymbol(row, col)) {
            checkWin();
            nextPlayerTurn();
        }
    };
    return (playRound);
});



