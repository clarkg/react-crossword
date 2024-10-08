import type {
  CellData,
  CluesData,
  CluesInput,
  Direction,
  GridData,
  UsedCellData,
} from './types';

type RowOrCol = 'row' | 'col';

const directionInfo: Record<
  Direction,
  { primary: RowOrCol; orthogonal: RowOrCol }
> = {
  across: {
    primary: 'col',
    orthogonal: 'row',
  },
  down: {
    primary: 'row',
    orthogonal: 'col',
  },
};

interface RowColMax {
  row: number;
  col: number;
}

export const bothDirections = Object.keys(directionInfo) as Direction[];

export function isAcross(direction: Direction) {
  return direction === 'across';
}

export function otherDirection(direction: Direction) {
  return isAcross(direction) ? 'down' : 'across';
}

export function calculateExtents(data: CluesInput, direction: Direction) {
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

  const rowColMax: RowColMax = {
    row: 0,
    col: 0,
  };

  rowColMax[dir.primary] = primaryMax;
  rowColMax[dir.orthogonal] = orthogonalMax;

  return rowColMax;
}

export function createEmptyGrid(rows: number, cols: number) {
  const gridData: GridData = Array(rows);
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

export function transformCluesInputToCluesDataForDirection(
  cluesInputData: CluesInput,
  direction: Direction,
  clues: CluesData
) {
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

export function transformCluesInputToCluesData(cluesInputData: CluesInput) {
  const clues: CluesData = {
    across: [],
    down: [],
  };

  (['across', 'down'] as Direction[]).forEach((direction) => {
    transformCluesInputToCluesDataForDirection(
      cluesInputData,
      direction,
      clues
    );
  });

  return clues;
}

export function fillClues(
  gridData: GridData,
  clues: CluesData,
  cluesInputData: CluesInput,
  direction: Direction
) {
  const dir = directionInfo[direction];

  Object.entries(cluesInputData[direction]).forEach(([number, info]) => {
    const { row: rowStart, col: colStart, answer } = info;
    for (let i = 0; i < answer.length; i++) {
      const row = rowStart + (dir.primary === 'row' ? i : 0);
      const col = colStart + (dir.primary === 'col' ? i : 0);
      const cellData = gridData[row][col] as UsedCellData;

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

export function createEmptyGridForClues(
  cluesInputData: CluesInput,
  allowNonSquare?: boolean
) {
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

export function createCluesDataAndFillGridWithClues(
  gridData: GridData,
  cluesInputData: CluesInput
) {
  const clues: CluesData = {
    across: [],
    down: [],
  };

  fillClues(gridData, clues, cluesInputData, 'across');
  fillClues(gridData, clues, cluesInputData, 'down');

  return clues;
}

// Given the "nice format" for a crossword, generate the usable data optimized
// for rendering and our interactivity.
export function createGridFilledWithClues(
  cluesInputData: CluesInput,
  allowNonSquare?: boolean
) {
  const { rows, cols, gridData } = createEmptyGridForClues(
    cluesInputData,
    allowNonSquare
  );
  const clues = createCluesDataAndFillGridWithClues(gridData, cluesInputData);
  return { rows, cols, gridData, clues };
}

// sort helper for clues...
interface HasNumber {
  number: string;
}

export function byNumber(a: HasNumber, b: HasNumber) {
  const aNum = Number.parseInt(a.number, 10);
  const bNum = Number.parseInt(b.number, 10);

  return aNum - bNum;
}

// Guesses *really* only needs the "guess" property...
export type GuessData = ({ guess?: string } | CellData)[][];

export function loadGuessesFromDB(
  gridData: GuessData,
  guessesFromDB: Array<{ row: number; col: number; guess: string }>
) {
  // Reset all guesses to undefined
  gridData.forEach((row) => {
    row.forEach((cell) => {
      if ((cell as UsedCellData).used) {
        (cell as UsedCellData).guess = undefined;
      }
    });
  });

  // Load guesses from DB
  guessesFromDB.forEach((g) => {
    const { row, col, guess } = g;
    (gridData[row][col] as UsedCellData).guess = guess;
  });
}

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
