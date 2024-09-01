import type { CellData, CluesData, CluesInput, Direction, GridData } from './types';
interface RowColMax {
    row: number;
    col: number;
}
export declare const bothDirections: Direction[];
export declare function isAcross(direction: Direction): boolean;
export declare function otherDirection(direction: Direction): "across" | "down";
export declare function calculateExtents(data: CluesInput, direction: Direction): RowColMax;
export declare function createEmptyGrid(rows: number, cols: number): GridData;
export declare function transformCluesInputToCluesDataForDirection(cluesInputData: CluesInput, direction: Direction, clues: CluesData): void;
export declare function transformCluesInputToCluesData(cluesInputData: CluesInput): CluesData;
export declare function fillClues(gridData: GridData, clues: CluesData, cluesInputData: CluesInput, direction: Direction): void;
export declare function createEmptyGridForClues(cluesInputData: CluesInput, allowNonSquare?: boolean): {
    rows: number;
    cols: number;
    gridData: GridData;
};
export declare function createCluesDataAndFillGridWithClues(gridData: GridData, cluesInputData: CluesInput): CluesData;
export declare function createGridFilledWithClues(cluesInputData: CluesInput, allowNonSquare?: boolean): {
    rows: number;
    cols: number;
    gridData: GridData;
    clues: CluesData;
};
interface HasNumber {
    number: string;
}
export declare function byNumber(a: HasNumber, b: HasNumber): number;
export type GuessData = ({
    guess?: string;
} | CellData)[][];
export declare function loadGuessesFromDB(gridData: GuessData, guessesFromDB: Array<{
    row: number;
    col: number;
    guess: string;
}>): void;
export {};
