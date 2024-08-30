/* eslint-disable no-console */

import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';

import produce from 'immer';
import { ThemeContext, ThemeProvider } from 'styled-components';

import { CrosswordContext, CrosswordContextType } from './context';
import {
  CluesData,
  CluesInput,
  cluesInputShapeOriginal,
  Direction,
  EnhancedProps,
  FocusHandler,
  GridPosition,
  GridData,
  UsedCellData,
  CellData,
  UnusedCellData,
} from './types';
import {
  bothDirections,
  createGridData,
  isAcross,
  loadGuessesFromDB,
  otherDirection,
} from './util';

export const crosswordProviderPropTypes = {
  /**
   * clue/answer data; see <a
   * href="#/Configuration%20and%20customization/Clue%20input%20format">Clue
   * input format</a> for details.
   */
  data: cluesInputShapeOriginal.isRequired,

  /** presentation values for the crossword; these override any values coming from a parent ThemeProvider context. */
  theme: PropTypes.shape({
    /**
     * whether to allow a non-square rendering
     * @since 5.1.0
     */
    allowNonSquare: PropTypes.bool,

    /** browser-width at which the clues go from showing beneath the grid to showing beside the grid */
    columnBreakpoint: PropTypes.string,

    /** overall background color (fill) for the crossword grid; can be `'transparent'` to show through a page background image */
    gridBackground: PropTypes.string,
    /**  background for an answer cell */
    cellBackground: PropTypes.string,
    /** border for an answer cell */
    cellBorder: PropTypes.string,
    /** color for answer text (entered by the player) */
    textColor: PropTypes.string,
    /** color for the across/down numbers in the grid */
    numberColor: PropTypes.string,
    /** background color for the cell with focus, the one that the player is typing into */
    focusBackground: PropTypes.string,
    /**
     * background color for the cells in the answer the player is working on,
     * helps indicate in which direction focus will be moving; also used as a
     * background on the active clue
     */
    highlightBackground: PropTypes.string,
  }),

  allowMutation: PropTypes.bool,

  /**
   * callback function called when a cell changes (e.g. when the user types a
   * letter); called with `(row, col, char)` arguments, where the `row` and
   * `column` are the 0-based position of the cell, and `char` is the character
   * typed (already massaged into upper-case)
   */
  onCellChange: PropTypes.func,

  /**
   * callback function called when a clue is selected
   */
  onClueSelected: PropTypes.func,

  children: PropTypes.node,
};

export type CrosswordProviderProps = EnhancedProps<
  typeof crosswordProviderPropTypes,
  {
    /**
     * clue/answer data; see <a
     * href="#/Configuration%20and%20customization/Clue%20input%20format">Clue
     * input format</a> for details.
     */
    data: CluesInput;

    guessesFromDB?: Array<{ row: number; col: number; guess: string }>;

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
  }
>;

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

const defaultTheme: CrosswordProviderProps['theme'] = {
  allowNonSquare: false,
  columnBreakpoint: '768px',
  gridBackground: 'rgb(0,0,0)',
  cellBackground: 'rgb(255,255,255)',
  cellBorder: 'rgb(0,0,0)',
  textColor: 'rgb(0,0,0)',
  numberColor: 'rgba(0,0,0, 0.25)',
  focusBackground: 'rgb(255,255,0)',
  highlightBackground: 'rgb(255,255,204)',
};

/**
 * The fundamental logic and data management component for react-crossword.
 * Prior to 4.0, puzzle management was built into the `Crossword` component.  As
 * of 4.0, the logic implementation has been refactored such that `Crossword`
 * leverages `CrosswordProvider` to do the heavy lifting.
 *
 * @since 4.0
 */
const CrosswordProvider = React.forwardRef<
  CrosswordProviderImperative,
  CrosswordProviderProps
>(
  (
    {
      data,
      theme,
      onCellChange,
      onGridChange,
      onClueSelected,
      allowMutation,
      children,
      guessesFromDB,
    },
    ref
  ) => {
    const contextTheme =
      useContext<CrosswordProviderProps['theme']>(ThemeContext);

    // The final theme is the merger of three values: the "theme" property
    // passed to the component (which takes precedence), any values from
    // ThemeContext, and finally the "defaultTheme" values fill in for any
    // needed ones that are missing.  (We create this in standard last-one-wins
    // order in Javascript, of course.)
    const finalTheme = useMemo(
      () => ({ ...defaultTheme, ...contextTheme, ...theme }),
      [contextTheme, theme]
    );

    const [gridData, setGridData] = useState<GridData>([]);
    const [clues, setClues] = useState<CluesData | undefined>();

    const [rows, setRows] = useState(0);
    const [cols, setCols] = useState(0);

    // We can't seem to use state to track the registeredFocusHandler, because
    // there seems to be a delay in 'focus' being usable after it's set.  We use
    // a Ref instead.
    const registeredFocusHandler = useRef<FocusHandler | null>(null);

    // interactive player state
    const [focused, setFocused] = useState(false);
    const [focusedRow, setFocusedRow] = useState(0); // rename to selectedRow?
    const [focusedCol, setFocusedCol] = useState(0);
    const [currentDirection, setCurrentDirection] =
      useState<Direction>('across');
    const [currentNumber, setCurrentNumber] = useState('1');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [bulkChange, setBulkChange] = useState<string | null>(null);

    // This *internal* getCellData assumes that it's only ever asked for a valid
    // cell (one that's used).
    const getCellData = useCallback(
      (row: number, col: number) => {
        console.log('getCellData', row, col, rows, cols);
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          return gridData[row][col];
        }

        // fake cellData to represent "out of bounds"
        return { row, col, used: false, outOfBounds: true } as GridPosition &
          UnusedCellData;
      },
      [cols, gridData, rows]
    );

    const setCellCharacter = useCallback(
      (row: number, col: number, char: string) => {
        const cell = getCellData(row, col);

        if (!cell.used) {
          throw new Error('unexpected setCellCharacter call');
        }

        // If the character is already the cell's guess, there's nothing to do.
        if (cell.guess === char) {
          return;
        }

        // update the gridData with the guess
        /*
        setGridData(
          produce((draft) => {
            (draft[row][col] as UsedCellData).guess = char;
          })
        );
        */

        if (onCellChange) {
          onCellChange(row, col, char);
        }
      },
      [getCellData, onCellChange]
    );

    useEffect(() => {
      if (allowMutation && onGridChange) {
        onGridChange(gridData);
      }
    }, [gridData, onGridChange, allowMutation]);

    // focus and movement
    const focus = useCallback(() => {
      // console.log('CrosswordProvider.focus() called...');

      // If there's a registered focus handler, use it!
      if (registeredFocusHandler.current) {
        // console.log('calling registered focus handler...');
        registeredFocusHandler.current();
        setFocused(true);
      } else {
        console.warn(
          'CrosswordProvider: focus() has no registered handler to call!'
        );
      }
    }, []);

    const moveTo = useCallback(
      (row: number, col: number, directionOverride?: Direction) => {
        let direction = directionOverride ?? currentDirection;
        const candidate = getCellData(row, col);

        if (!candidate.used) {
          return false;
        }

        // If we try to move to a cell with a direction it doesn't support,
        // switch to the other direction.  There is no codepath that can test
        // this, though, as this callback isn't exposed, and we only call it in
        // ways that guarantee that direction is valid.
        if (!candidate[direction]) {
          /* istanbul ignore next */
          direction = otherDirection(direction);
        }

        setFocusedRow(row);
        setFocusedCol(col);
        setCurrentDirection(direction);
        setCurrentNumber(candidate[direction] ?? '');

        return candidate;
      },
      [currentDirection, getCellData]
    );

    const moveRelative = useCallback(
      (dRow: number, dCol: number) => {
        // We expect *only* one of dRow or dCol to have a non-zero value, and
        // that's the direction we will "prefer".  If *both* are set (or zero),
        // we don't change the direction.
        let direction: Direction | undefined;
        if (dRow !== 0 && dCol === 0) {
          direction = 'down';
        } else if (dRow === 0 && dCol !== 0) {
          direction = 'across';
        }

        const cell = moveTo(focusedRow + dRow, focusedCol + dCol, direction);

        return cell;
      },
      [focusedRow, focusedCol, moveTo]
    );

    const moveForward = useCallback(() => {
      const across = isAcross(currentDirection);
      moveRelative(across ? 0 : 1, across ? 1 : 0);
    }, [currentDirection, moveRelative]);

    const moveBackward = useCallback(() => {
      const across = isAcross(currentDirection);
      moveRelative(across ? 0 : -1, across ? -1 : 0);
    }, [currentDirection, moveRelative]);

    // keyboard handling
    const handleSingleCharacter = useCallback(
      (char: string) => {
        if (allowMutation) {
          setCellCharacter(focusedRow, focusedCol, char.toUpperCase());
          moveForward();
        }
      },
      [focusedRow, focusedCol, setCellCharacter, moveForward, allowMutation]
    );

    // We use the keydown event for control/arrow keys, but not for textual
    // input, because it's hard to suss out when a key is "regular" or not.
    const handleInputKeyDown = useCallback<
      React.KeyboardEventHandler<HTMLInputElement>
    >(
      (event) => {
        // if ctrl, alt, or meta are down, ignore the event (let it bubble)
        if (event.ctrlKey || event.altKey || event.metaKey) {
          return;
        }

        let preventDefault = true;
        const { key } = event;
        // console.log('CROSSWORD KEYDOWN', event.key);

        // FUTURE: should we "jump" over black space?  That might help some for
        // keyboard users.
        switch (key) {
          case 'ArrowUp':
            moveRelative(-1, 0);
            break;

          case 'ArrowDown':
            moveRelative(1, 0);
            break;

          case 'ArrowLeft':
            moveRelative(0, -1);
            break;

          case 'ArrowRight':
            moveRelative(0, 1);
            break;

          case ' ': // treat space like tab?
          case 'Tab': {
            const other = otherDirection(currentDirection);
            const cellData = getCellData(
              focusedRow,
              focusedCol
            ) as UsedCellData;
            if (cellData[other]) {
              setCurrentDirection(other);
              setCurrentNumber(cellData[other] ?? '');
            }
            break;
          }

          // Backspace: delete the current cell, and move to the previous cell
          // Delete:    delete the current cell, but don't move
          case 'Backspace':
          case 'Delete': {
            if (allowMutation) {
              setCellCharacter(focusedRow, focusedCol, '');
            }
            if (key === 'Backspace') {
              moveBackward();
            }
            break;
          }

          case 'Home':
          case 'End': {
            // move to beginning/end of this entry?
            const info = data[currentDirection][currentNumber];
            const {
              answer: { length },
            } = info;
            let { row, col } = info;
            if (key === 'End') {
              const across = isAcross(currentDirection);
              if (across) {
                col += length - 1;
              } else {
                row += length - 1;
              }
            }

            moveTo(row, col);
            break;
          }

          default:
            // It would be nice to handle "regular" characters with onInput, but
            // that is still experimental, so we can't count on it.  Instead, we
            // assume that only "length 1" values are regular.
            if (key.length !== 1) {
              preventDefault = false;
              break;
            }

            handleSingleCharacter(key);
            break;
        }

        if (preventDefault) {
          event.preventDefault();
        }
      },
      [
        moveRelative,
        handleSingleCharacter,
        currentDirection,
        getCellData,
        focusedRow,
        focusedCol,
        setCellCharacter,
        moveBackward,
        data,
        currentNumber,
        moveTo,
        allowMutation,
      ]
    );

    const handleInputChange = useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >((event) => {
      event.preventDefault();
      setBulkChange(event.target.value);
    }, []);

    useEffect(() => {
      if (!bulkChange) {
        return;
      }

      // handle bulkChange by updating a character at a time (this lets us
      // leverage the existing character-entry logic).
      handleSingleCharacter(bulkChange[0]);
      setBulkChange(bulkChange.length === 1 ? null : bulkChange.substring(1));
    }, [bulkChange, handleSingleCharacter]);

    // When the clues *input* data changes, reset/reload the player data
    useEffect(() => {
      // The original Crossword implementation used separate state to track size
      // and grid data, and conflated the clues-input-data-based grid data and the
      // player input guesses.  Let's see if we can keep the clues-input and
      // player data segregated.
      const {
        rows: numRows,
        cols: numCols,
        gridData: masterGridData,
        clues: masterClues,
      } = createGridData(data, finalTheme.allowNonSquare ?? false);

      console.log('masterGridData', masterGridData);

      setRows(numRows);
      setCols(numCols);
      setGridData(masterGridData);
      setClues(masterClues);

      // Find the element with the lowest number in the 2D array newGridData
      let lowestNumberCell: UsedCellData | null = null;
      for (let row = 0; row < masterGridData.length; row++) {
        for (let col = 0; col < masterGridData[row].length; col++) {
          const cell = masterGridData[row][col];
          if (cell.used && cell.number) {
            if (
              !lowestNumberCell ||
              parseInt(cell.number, 10) < parseInt(lowestNumberCell.number!, 10)
            ) {
              lowestNumberCell = cell as UsedCellData;
            }
          }
        }
      }

      // Set focus to the cell with the lowest number
      if (lowestNumberCell) {
        setFocusedRow(lowestNumberCell.row);
        setFocusedCol(lowestNumberCell.col);
        setCurrentNumber(lowestNumberCell.number!);

        // Find the direction of the clue corresponding to the lowestNumberCell number
        let lowestNumberDirection: Direction = 'across';
        const lowestNumber = lowestNumberCell.number!;

        // Check across clues first
        const acrossClue = masterClues.across.find(
          (clue) => clue.number === lowestNumber
        );
        if (acrossClue) {
          lowestNumberDirection = 'across';
        } else {
          // If not found in across, check down clues
          const downClue = masterClues.down.find(
            (clue) => clue.number === lowestNumber
          );
          if (downClue) {
            lowestNumberDirection = 'down';
          }
        }

        // Set the current direction to the direction of the lowest numbered clue
        setCurrentDirection(lowestNumberDirection);
        focus();
      }
    }, [data, finalTheme.allowNonSquare, guessesFromDB]);

    useEffect(() => {
      console.log('guessesFromDB', guessesFromDB);
      if (guessesFromDB && guessesFromDB.length > 0) {
        loadGuessesFromDB(gridData, guessesFromDB);
      }
      setGridData(gridData);
    }, [guessesFromDB]);

    const handleCellClick = useCallback(
      (cellData: CellData) => {
        if (cellData.used) {
          const { row, col } = cellData;
          const other = otherDirection(currentDirection);

          // should this use moveTo?
          setFocusedRow(row);
          setFocusedCol(col);

          let direction = currentDirection;

          // We switch to the "other" direction if (a) the current direction
          // isn't available in the clicked cell, or (b) we're already focused
          // and the clicked cell is the focused cell, *and* the other direction
          // is available.
          if (
            !cellData[currentDirection] ||
            (focused &&
              row === focusedRow &&
              col === focusedCol &&
              cellData[other])
          ) {
            setCurrentDirection(other);
            direction = other;
          }

          setCurrentNumber(cellData[direction] ?? '');
        }

        focus();
      },
      [currentDirection, focus, focused, focusedCol, focusedRow]
    );

    const handleInputClick = useCallback<
      React.MouseEventHandler<HTMLInputElement>
    >(
      (/* event */) => {
        // *don't* event.preventDefault(), because we want the input to actually
        // take focus

        // Like general cell-clicks, cliking on the input can change direction.
        // Unlike cell clicks, we *know* we're clicking on the already-focused
        // cell!
        const other = otherDirection(currentDirection);
        const cellData = getCellData(focusedRow, focusedCol) as UsedCellData;

        let direction = currentDirection;

        if (focused && cellData[other]) {
          setCurrentDirection(other);
          direction = other;
        }

        setCurrentNumber(cellData[direction] ?? '');
        focus();
      },
      [currentDirection, focus, focused, focusedCol, focusedRow, getCellData]
    );

    const handleClueSelected = useCallback(
      (direction: Direction, number: string) => {
        const info = clues?.[direction].find((clue) => clue.number === number);

        if (!info) {
          return;
        }

        // console.log('CrosswordProvider.handleClueSelected', { info });
        // TODO: sanity-check info?
        moveTo(info.row, info.col, direction);
        focus();

        if (onClueSelected) {
          onClueSelected(direction, number);
        }
      },
      [clues, focus, moveTo, onClueSelected]
    );

    const registerFocusHandler = useCallback(
      (focusHandler: FocusHandler | null) => {
        // console.log('CrosswordProvider.registerFocusHandler() called', {
        //   name: focusHandler?.name ?? '(NULL)',
        //   focusHandler,
        // });

        // *If* registeredFocusHandler is implemented as state, realize that we
        // can't simply pass it to the setter... the useState React setter would
        // *invoke* the function and take the return value!  So, we would have
        // to wrap it in a functional setter (setState(() => focusHandler)).
        // But, since we're using a Ref, this is just a simple assignment!
        registeredFocusHandler.current = focusHandler;
      },
      []
    );

    // imperative commands...
    useImperativeHandle(
      ref,
      () => ({
        /**
         * Sets focus to the crossword component.
         */
        focus,

        /**
         * Resets the entire crossword; clearing all answers in the grid and
         * also any persisted data.
         */
        reset: () => {
          setGridData(
            produce((draft) => {
              draft.forEach((rowData) => {
                rowData.forEach((cellData) => {
                  if (cellData.used) {
                    cellData.guess = '';
                  }
                });
              });
            })
          );

          setClues(
            produce((draft) => {
              bothDirections.forEach((direction) => {
                draft?.[direction]?.forEach((clueInfo) => clueInfo);
              });
            })
          );
        },

        /**
         * Sets the “guess” character for a specific grid position.
         *
         * @since 4.1.0
         */
        setGuess: (row: number, col: number, guess: string) => {
          // REVIEW: should we force-case this?
          setCellCharacter(row, col, guess.toUpperCase());
        },

        /**
         * Returns the current grid data.
         */
        getGridData: () => gridData,
      }),
      [clues, focus, setCellCharacter, gridData]
    );

    const crosswordContext = useMemo<CrosswordContextType>(
      () => ({
        rows,
        cols,
        gridData,
        clues,

        handleInputKeyDown,
        handleInputChange,
        handleCellClick,
        handleInputClick,
        handleClueSelected,
        registerFocusHandler,

        focused,
        selectedPosition: { row: focusedRow, col: focusedCol },
        selectedDirection: currentDirection,
        selectedNumber: currentNumber,
      }),
      [
        rows,
        cols,
        gridData,
        clues,
        handleInputKeyDown,
        handleInputChange,
        handleCellClick,
        handleInputClick,
        handleClueSelected,
        registerFocusHandler,
        focused,
        focusedRow,
        focusedCol,
        currentDirection,
        currentNumber,
      ]
    );

    return (
      <ThemeProvider theme={finalTheme}>
        <CrosswordContext.Provider value={crosswordContext}>
          {children}
        </CrosswordContext.Provider>
      </ThemeProvider>
    );
  }
);

export default CrosswordProvider;

CrosswordProvider.displayName = 'CrosswordProvider';
CrosswordProvider.propTypes = crosswordProviderPropTypes;
CrosswordProvider.defaultProps = {
  theme: undefined,
  allowMutation: true,
  onCellChange: undefined,
  onClueSelected: undefined,
  children: undefined,
};
