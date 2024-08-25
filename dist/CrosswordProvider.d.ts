import React from 'react';
import PropTypes from 'prop-types';
import { CluesInput, Direction, EnhancedProps, GridData } from './types';
export declare const crosswordProviderPropTypes: {
    /**
     * clue/answer data; see <a
     * href="#/Configuration%20and%20customization/Clue%20input%20format">Clue
     * input format</a> for details.
     */
    data: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
        across: PropTypes.Validator<{
            [x: string]: NonNullable<PropTypes.InferProps<{
                clue: PropTypes.Validator<string>;
                answer: PropTypes.Validator<string>;
                row: PropTypes.Validator<number>;
                col: PropTypes.Validator<number>;
            }>>;
        }>;
        /**  background for an answer cell */
        down: PropTypes.Validator<{
            [x: string]: NonNullable<PropTypes.InferProps<{
                clue: PropTypes.Validator<string>;
                answer: PropTypes.Validator<string>;
                row: PropTypes.Validator<number>;
                col: PropTypes.Validator<number>;
            }>>;
        }>;
    }>>>;
    /** presentation values for the crossword; these override any values coming from a parent ThemeProvider context. */
    theme: PropTypes.Requireable<PropTypes.InferProps<{
        /**
         * whether to allow a non-square rendering
         * @since 5.1.0
         */
        allowNonSquare: PropTypes.Requireable<boolean>;
        /** browser-width at which the clues go from showing beneath the grid to showing beside the grid */
        columnBreakpoint: PropTypes.Requireable<string>;
        /** overall background color (fill) for the crossword grid; can be `'transparent'` to show through a page background image */
        gridBackground: PropTypes.Requireable<string>;
        /**  background for an answer cell */
        cellBackground: PropTypes.Requireable<string>;
        /** border for an answer cell */
        cellBorder: PropTypes.Requireable<string>;
        /** color for answer text (entered by the player) */
        textColor: PropTypes.Requireable<string>;
        /** color for the across/down numbers in the grid */
        numberColor: PropTypes.Requireable<string>;
        /** background color for the cell with focus, the one that the player is typing into */
        focusBackground: PropTypes.Requireable<string>;
        /**
         * background color for the cells in the answer the player is working on,
         * helps indicate in which direction focus will be moving; also used as a
         * background on the active clue
         */
        highlightBackground: PropTypes.Requireable<string>;
    }>>;
    allowMutation: PropTypes.Requireable<boolean>;
    /**
     * callback function called when a cell changes (e.g. when the user types a
     * letter); called with `(row, col, char)` arguments, where the `row` and
     * `column` are the 0-based position of the cell, and `char` is the character
     * typed (already massaged into upper-case)
     */
    onCellChange: PropTypes.Requireable<(...args: any[]) => any>;
    /**
     * callback function called when a clue is selected
     */
    onClueSelected: PropTypes.Requireable<(...args: any[]) => any>;
    children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
};
export type CrosswordProviderProps = EnhancedProps<typeof crosswordProviderPropTypes, {
    /**
     * clue/answer data; see <a
     * href="#/Configuration%20and%20customization/Clue%20input%20format">Clue
     * input format</a> for details.
     */
    data: CluesInput;
    guessesFromDB?: Array<{
        row: number;
        col: number;
        guess: string;
    }>;
    /**
     * callback function called when a cell changes (e.g. when the user types a
     * letter); called with `(row, col, char)` arguments, where the `row` and
     * `column` are the 0-based position of the cell, and `char` is the
     * character typed (already massaged into upper-case)
     */
    onCellChange?: (row: number, col: number, char: string) => void;
    onGridChange?: (gridData: GridData) => void;
    /**
     * callback function called when a clue is selected
     */
    onClueSelected?: (direction: Direction, number: string) => void;
}>;
export interface CrosswordProviderImperative {
    /**
     * Sets focus to the crossword component.
     */
    focus: () => void;
    /**
     * Resets the entire crossword; clearing all answers in the grid and
     * also any persisted data.
     */
    reset: () => void;
    /**
     * Sets the “guess” character for a specific grid position.
     *
     * @since 4.1.0
     */
    setGuess: (row: number, col: number, guess: string) => void;
    getGridData: () => GridData;
}
/**
 * The fundamental logic and data management component for react-crossword.
 * Prior to 4.0, puzzle management was built into the `Crossword` component.  As
 * of 4.0, the logic implementation has been refactored such that `Crossword`
 * leverages `CrosswordProvider` to do the heavy lifting.
 *
 * @since 4.0
 */
declare const CrosswordProvider: React.ForwardRefExoticComponent<Omit<PropTypes.InferProps<{
    /**
     * clue/answer data; see <a
     * href="#/Configuration%20and%20customization/Clue%20input%20format">Clue
     * input format</a> for details.
     */
    data: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
        across: PropTypes.Validator<{
            [x: string]: NonNullable<PropTypes.InferProps<{
                clue: PropTypes.Validator<string>;
                answer: PropTypes.Validator<string>;
                row: PropTypes.Validator<number>;
                col: PropTypes.Validator<number>;
            }>>;
        }>;
        /**  background for an answer cell */
        down: PropTypes.Validator<{
            [x: string]: NonNullable<PropTypes.InferProps<{
                clue: PropTypes.Validator<string>;
                answer: PropTypes.Validator<string>;
                row: PropTypes.Validator<number>;
                col: PropTypes.Validator<number>;
            }>>;
        }>;
    }>>>;
    /** presentation values for the crossword; these override any values coming from a parent ThemeProvider context. */
    theme: PropTypes.Requireable<PropTypes.InferProps<{
        /**
         * whether to allow a non-square rendering
         * @since 5.1.0
         */
        allowNonSquare: PropTypes.Requireable<boolean>;
        /** browser-width at which the clues go from showing beneath the grid to showing beside the grid */
        columnBreakpoint: PropTypes.Requireable<string>;
        /** overall background color (fill) for the crossword grid; can be `'transparent'` to show through a page background image */
        gridBackground: PropTypes.Requireable<string>;
        /**  background for an answer cell */
        cellBackground: PropTypes.Requireable<string>;
        /** border for an answer cell */
        cellBorder: PropTypes.Requireable<string>;
        /** color for answer text (entered by the player) */
        textColor: PropTypes.Requireable<string>;
        /** color for the across/down numbers in the grid */
        numberColor: PropTypes.Requireable<string>;
        /** background color for the cell with focus, the one that the player is typing into */
        focusBackground: PropTypes.Requireable<string>;
        /**
         * background color for the cells in the answer the player is working on,
         * helps indicate in which direction focus will be moving; also used as a
         * background on the active clue
         */
        highlightBackground: PropTypes.Requireable<string>;
    }>>;
    allowMutation: PropTypes.Requireable<boolean>;
    /**
     * callback function called when a cell changes (e.g. when the user types a
     * letter); called with `(row, col, char)` arguments, where the `row` and
     * `column` are the 0-based position of the cell, and `char` is the character
     * typed (already massaged into upper-case)
     */
    onCellChange: PropTypes.Requireable<(...args: any[]) => any>;
    /**
     * callback function called when a clue is selected
     */
    onClueSelected: PropTypes.Requireable<(...args: any[]) => any>;
    children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
}>, "data" | "onCellChange" | "onClueSelected" | "guessesFromDB" | "onGridChange"> & {
    /**
     * clue/answer data; see <a
     * href="#/Configuration%20and%20customization/Clue%20input%20format">Clue
     * input format</a> for details.
     */
    data: CluesInput;
    guessesFromDB?: {
        row: number;
        col: number;
        guess: string;
    }[] | undefined;
    /**
     * callback function called when a cell changes (e.g. when the user types a
     * letter); called with `(row, col, char)` arguments, where the `row` and
     * `column` are the 0-based position of the cell, and `char` is the
     * character typed (already massaged into upper-case)
     */
    onCellChange?: ((row: number, col: number, char: string) => void) | undefined;
    onGridChange?: ((gridData: GridData) => void) | undefined;
    /**
     * callback function called when a clue is selected
     */
    onClueSelected?: ((direction: Direction, number: string) => void) | undefined;
} & React.RefAttributes<CrosswordProviderImperative>>;
export default CrosswordProvider;
