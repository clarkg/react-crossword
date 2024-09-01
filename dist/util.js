Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGuessesFromDB = exports.byNumber = exports.createGridFilledWithClues = exports.createCluesDataAndFillGridWithClues = exports.createEmptyGridForClues = exports.fillClues = exports.transformCluesInputToCluesData = exports.transformCluesInputToCluesDataForDirection = exports.createEmptyGrid = exports.calculateExtents = exports.otherDirection = exports.isAcross = exports.bothDirections = void 0;
const directionInfo = {
    across: {
        primary: 'col',
        orthogonal: 'row',
    },
    down: {
        primary: 'row',
        orthogonal: 'col',
    },
};
exports.bothDirections = Object.keys(directionInfo);
function isAcross(direction) {
    return direction === 'across';
}
exports.isAcross = isAcross;
function otherDirection(direction) {
    return isAcross(direction) ? 'down' : 'across';
}
exports.otherDirection = otherDirection;
function calculateExtents(data, direction) {
    const dir = directionInfo[direction];
    let primaryMax = 0;
    let orthogonalMax = 0;
    Object.entries(data[direction]).forEach(([, info]) => {
        const primary = info[dir.primary] + info.answer.length - 1;
        if (primary > primaryMax) {
            primaryMax = primary;
        }
        const orthogonal = info[dir.orthogonal];
        if (orthogonal > orthogonalMax) {
            orthogonalMax = orthogonal;
        }
    });
    const rowColMax = {
        row: 0,
        col: 0,
    };
    rowColMax[dir.primary] = primaryMax;
    rowColMax[dir.orthogonal] = orthogonalMax;
    return rowColMax;
}
exports.calculateExtents = calculateExtents;
function createEmptyGrid(rows, cols) {
    const gridData = Array(rows);
    // Rather than [x][y] in column-major order, the cells are indexed as
    // [row][col] in row-major order.
    for (let r = 0; r < rows; r++) {
        gridData[r] = Array(cols);
        for (let c = 0; c < cols; c++) {
            gridData[r][c] = {
                // ...emptyCellData,
                row: r,
                col: c,
                used: false,
            };
        }
    }
    return gridData;
}
exports.createEmptyGrid = createEmptyGrid;
function transformCluesInputToCluesDataForDirection(cluesInputData, direction, clues) {
    Object.entries(cluesInputData[direction]).forEach(([number, info]) => {
        const { row: rowStart, col: colStart, clue, answer } = info;
        clues[direction].push({
            number,
            clue,
            answer,
            col: colStart,
            row: rowStart,
        });
    });
    clues[direction].sort(byNumber);
}
exports.transformCluesInputToCluesDataForDirection = transformCluesInputToCluesDataForDirection;
function transformCluesInputToCluesData(cluesInputData) {
    const clues = {
        across: [],
        down: [],
    };
    ['across', 'down'].forEach((direction) => {
        transformCluesInputToCluesDataForDirection(cluesInputData, direction, clues);
    });
    return clues;
}
exports.transformCluesInputToCluesData = transformCluesInputToCluesData;
function fillClues(gridData, clues, cluesInputData, direction) {
    const dir = directionInfo[direction];
    Object.entries(cluesInputData[direction]).forEach(([number, info]) => {
        const { row: rowStart, col: colStart, answer } = info;
        for (let i = 0; i < answer.length; i++) {
            const row = rowStart + (dir.primary === 'row' ? i : 0);
            const col = colStart + (dir.primary === 'col' ? i : 0);
            const cellData = gridData[row][col];
            // TODO?: check to ensure the answer is the same if it's already set?
            cellData.used = true;
            cellData.answer = answer[i];
            cellData[direction] = number;
            if (i === 0) {
                // TODO?: check to ensure the number is the same if it's already set?
                cellData.number = number;
            }
        }
    });
    transformCluesInputToCluesDataForDirection(cluesInputData, direction, clues);
}
exports.fillClues = fillClues;
function createEmptyGridForClues(cluesInputData, allowNonSquare) {
    const acrossMax = calculateExtents(cluesInputData, 'across');
    const downMax = calculateExtents(cluesInputData, 'down');
    let rows = Math.max(acrossMax.row, downMax.row) + 1;
    let cols = Math.max(acrossMax.col, downMax.col) + 1;
    if (!allowNonSquare) {
        const size = Math.max(rows, cols);
        rows = size;
        cols = size;
    }
    return { rows, cols, gridData: createEmptyGrid(rows, cols) };
}
exports.createEmptyGridForClues = createEmptyGridForClues;
function createCluesDataAndFillGridWithClues(gridData, cluesInputData) {
    const clues = {
        across: [],
        down: [],
    };
    fillClues(gridData, clues, cluesInputData, 'across');
    fillClues(gridData, clues, cluesInputData, 'down');
    return clues;
}
exports.createCluesDataAndFillGridWithClues = createCluesDataAndFillGridWithClues;
// Given the "nice format" for a crossword, generate the usable data optimized
// for rendering and our interactivity.
function createGridFilledWithClues(cluesInputData, allowNonSquare) {
    const { rows, cols, gridData } = createEmptyGridForClues(cluesInputData, allowNonSquare);
    const clues = createCluesDataAndFillGridWithClues(gridData, cluesInputData);
    return { rows, cols, gridData, clues };
}
exports.createGridFilledWithClues = createGridFilledWithClues;
function byNumber(a, b) {
    const aNum = Number.parseInt(a.number, 10);
    const bNum = Number.parseInt(b.number, 10);
    return aNum - bNum;
}
exports.byNumber = byNumber;
function loadGuessesFromDB(gridData, guessesFromDB) {
    // Reset all guesses to undefined
    gridData.forEach((row) => {
        row.forEach((cell) => {
            if (cell.used) {
                cell.guess = undefined;
            }
        });
    });
    // Load guesses from DB
    guessesFromDB.forEach((g) => {
        const { row, col, guess } = g;
        gridData[row][col].guess = guess;
    });
}
exports.loadGuessesFromDB = loadGuessesFromDB;
/*
export function findCorrectAnswers(data: CluesInput, gridData: GuessData) {
  const correctAnswers: AnswerTuple[] = [];

  bothDirections.forEach((direction) => {
    const across = isAcross(direction);
    Object.entries(data[direction]).forEach(([num, info]) => {
      const { row, col } = info;
      let correct = true;
      for (let i = 0; i < info.answer.length; i++) {
        const r = across ? row : row + i;
        const c = across ? col + i : col;
        if ((gridData[r][c] as UsedCellData).guess !== info.answer[i]) {
          correct = false;
          break;
        }
      }
      if (correct) {
        // same args as notifyCorrect: direction, number, answer
        correctAnswers.push([direction, num, info.answer]);
      }
    });
  });

  return correctAnswers;
}
*/
//# sourceMappingURL=util.js.map