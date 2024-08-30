"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crosswordProviderPropTypes = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-console */
const react_1 = __importStar(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
const immer_1 = __importDefault(require("immer"));
const styled_components_1 = require("styled-components");
const context_1 = require("./context");
const types_1 = require("./types");
const util_1 = require("./util");
exports.crosswordProviderPropTypes = {
    /**
     * clue/answer data; see <a
     * href="#/Configuration%20and%20customization/Clue%20input%20format">Clue
     * input format</a> for details.
     */
    data: types_1.cluesInputShapeOriginal.isRequired,
    /** presentation values for the crossword; these override any values coming from a parent ThemeProvider context. */
    theme: prop_types_1.default.shape({
        /**
         * whether to allow a non-square rendering
         * @since 5.1.0
         */
        allowNonSquare: prop_types_1.default.bool,
        /** browser-width at which the clues go from showing beneath the grid to showing beside the grid */
        columnBreakpoint: prop_types_1.default.string,
        /** overall background color (fill) for the crossword grid; can be `'transparent'` to show through a page background image */
        gridBackground: prop_types_1.default.string,
        /**  background for an answer cell */
        cellBackground: prop_types_1.default.string,
        /** border for an answer cell */
        cellBorder: prop_types_1.default.string,
        /** color for answer text (entered by the player) */
        textColor: prop_types_1.default.string,
        /** color for the across/down numbers in the grid */
        numberColor: prop_types_1.default.string,
        /** background color for the cell with focus, the one that the player is typing into */
        focusBackground: prop_types_1.default.string,
        /**
         * background color for the cells in the answer the player is working on,
         * helps indicate in which direction focus will be moving; also used as a
         * background on the active clue
         */
        highlightBackground: prop_types_1.default.string,
    }),
    allowMutation: prop_types_1.default.bool,
    /**
     * callback function called when a cell changes (e.g. when the user types a
     * letter); called with `(row, col, char)` arguments, where the `row` and
     * `column` are the 0-based position of the cell, and `char` is the character
     * typed (already massaged into upper-case)
     */
    onCellChange: prop_types_1.default.func,
    /**
     * callback function called when a clue is selected
     */
    onClueSelected: prop_types_1.default.func,
    children: prop_types_1.default.node,
};
const defaultTheme = {
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
const CrosswordProvider = react_1.default.forwardRef(({ data, theme, onCellChange, onGridChange, onClueSelected, allowMutation, children, guessesFromDB, }, ref) => {
    const contextTheme = (0, react_1.useContext)(styled_components_1.ThemeContext);
    // The final theme is the merger of three values: the "theme" property
    // passed to the component (which takes precedence), any values from
    // ThemeContext, and finally the "defaultTheme" values fill in for any
    // needed ones that are missing.  (We create this in standard last-one-wins
    // order in Javascript, of course.)
    const finalTheme = (0, react_1.useMemo)(() => (Object.assign(Object.assign(Object.assign({}, defaultTheme), contextTheme), theme)), [contextTheme, theme]);
    // The original Crossword implementation used separate state to track size
    // and grid data, and conflated the clues-input-data-based grid data and the
    // player input guesses.  Let's see if we can keep the clues-input and
    // player data segregated.
    const { rows, cols, gridData: masterGridData, clues: masterClues, } = (0, react_1.useMemo)(() => { var _a; return (0, util_1.createGridData)(data, (_a = finalTheme.allowNonSquare) !== null && _a !== void 0 ? _a : false); }, [data, finalTheme.allowNonSquare]);
    const [gridData, setGridData] = (0, react_1.useState)([]);
    const [clues, setClues] = (0, react_1.useState)();
    // We can't seem to use state to track the registeredFocusHandler, because
    // there seems to be a delay in 'focus' being usable after it's set.  We use
    // a Ref instead.
    const registeredFocusHandler = (0, react_1.useRef)(null);
    // interactive player state
    const [focused, setFocused] = (0, react_1.useState)(false);
    const [focusedRow, setFocusedRow] = (0, react_1.useState)(0); // rename to selectedRow?
    const [focusedCol, setFocusedCol] = (0, react_1.useState)(0);
    const [currentDirection, setCurrentDirection] = (0, react_1.useState)('across');
    const [currentNumber, setCurrentNumber] = (0, react_1.useState)('1');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [bulkChange, setBulkChange] = (0, react_1.useState)(null);
    // This *internal* getCellData assumes that it's only ever asked for a valid
    // cell (one that's used).
    const getCellData = (0, react_1.useCallback)((row, col) => {
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            return gridData[row][col];
        }
        // fake cellData to represent "out of bounds"
        return { row, col, used: false, outOfBounds: true };
    }, [cols, gridData, rows]);
    const setCellCharacter = (0, react_1.useCallback)((row, col, char) => {
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
    }, [getCellData, onCellChange]);
    (0, react_1.useEffect)(() => {
        if (allowMutation && onGridChange) {
            onGridChange(gridData);
        }
    }, [gridData, onGridChange, allowMutation]);
    // focus and movement
    const focus = (0, react_1.useCallback)(() => {
        // console.log('CrosswordProvider.focus() called...');
        // If there's a registered focus handler, use it!
        if (registeredFocusHandler.current) {
            // console.log('calling registered focus handler...');
            registeredFocusHandler.current();
            setFocused(true);
        }
        else {
            console.warn('CrosswordProvider: focus() has no registered handler to call!');
        }
    }, []);
    const moveTo = (0, react_1.useCallback)((row, col, directionOverride) => {
        var _a;
        let direction = directionOverride !== null && directionOverride !== void 0 ? directionOverride : currentDirection;
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
            direction = (0, util_1.otherDirection)(direction);
        }
        setFocusedRow(row);
        setFocusedCol(col);
        setCurrentDirection(direction);
        setCurrentNumber((_a = candidate[direction]) !== null && _a !== void 0 ? _a : '');
        return candidate;
    }, [currentDirection, getCellData]);
    const moveRelative = (0, react_1.useCallback)((dRow, dCol) => {
        // We expect *only* one of dRow or dCol to have a non-zero value, and
        // that's the direction we will "prefer".  If *both* are set (or zero),
        // we don't change the direction.
        let direction;
        if (dRow !== 0 && dCol === 0) {
            direction = 'down';
        }
        else if (dRow === 0 && dCol !== 0) {
            direction = 'across';
        }
        const cell = moveTo(focusedRow + dRow, focusedCol + dCol, direction);
        return cell;
    }, [focusedRow, focusedCol, moveTo]);
    const moveForward = (0, react_1.useCallback)(() => {
        const across = (0, util_1.isAcross)(currentDirection);
        moveRelative(across ? 0 : 1, across ? 1 : 0);
    }, [currentDirection, moveRelative]);
    const moveBackward = (0, react_1.useCallback)(() => {
        const across = (0, util_1.isAcross)(currentDirection);
        moveRelative(across ? 0 : -1, across ? -1 : 0);
    }, [currentDirection, moveRelative]);
    // keyboard handling
    const handleSingleCharacter = (0, react_1.useCallback)((char) => {
        if (allowMutation) {
            setCellCharacter(focusedRow, focusedCol, char.toUpperCase());
            moveForward();
        }
    }, [focusedRow, focusedCol, setCellCharacter, moveForward, allowMutation]);
    // We use the keydown event for control/arrow keys, but not for textual
    // input, because it's hard to suss out when a key is "regular" or not.
    const handleInputKeyDown = (0, react_1.useCallback)((event) => {
        var _a;
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
                const other = (0, util_1.otherDirection)(currentDirection);
                const cellData = getCellData(focusedRow, focusedCol);
                if (cellData[other]) {
                    setCurrentDirection(other);
                    setCurrentNumber((_a = cellData[other]) !== null && _a !== void 0 ? _a : '');
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
                const { answer: { length }, } = info;
                let { row, col } = info;
                if (key === 'End') {
                    const across = (0, util_1.isAcross)(currentDirection);
                    if (across) {
                        col += length - 1;
                    }
                    else {
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
    }, [
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
    ]);
    const handleInputChange = (0, react_1.useCallback)((event) => {
        event.preventDefault();
        setBulkChange(event.target.value);
    }, []);
    (0, react_1.useEffect)(() => {
        if (!bulkChange) {
            return;
        }
        // handle bulkChange by updating a character at a time (this lets us
        // leverage the existing character-entry logic).
        handleSingleCharacter(bulkChange[0]);
        setBulkChange(bulkChange.length === 1 ? null : bulkChange.substring(1));
    }, [bulkChange, handleSingleCharacter]);
    // When the clues *input* data changes, reset/reload the player data
    (0, react_1.useEffect)(() => {
        // Check if masterGridData has different dimensions from gridData
        console.log('gridData', gridData);
        console.log('masterGridData', masterGridData);
        if (gridData.length === 0 ||
            masterGridData.length !== gridData.length ||
            masterGridData[0].length !== gridData[0].length) {
            if (guessesFromDB && guessesFromDB.length > 0) {
                (0, util_1.loadGuessesFromDB)(masterGridData, guessesFromDB);
            }
            console.log("about to set gridData to masterGridData", masterGridData);
            setGridData(masterGridData);
            console.log('gridData', gridData);
        }
        setClues(masterClues);
        // Find the element with the lowest number in the 2D array newGridData
        let lowestNumberCell = null;
        for (let row = 0; row < masterGridData.length; row++) {
            for (let col = 0; col < masterGridData[row].length; col++) {
                const cell = masterGridData[row][col];
                if (cell.used && cell.number) {
                    if (!lowestNumberCell ||
                        parseInt(cell.number, 10) < parseInt(lowestNumberCell.number, 10)) {
                        lowestNumberCell = cell;
                    }
                }
            }
        }
        // Set focus to the cell with the lowest number
        if (lowestNumberCell) {
            setFocusedRow(lowestNumberCell.row);
            setFocusedCol(lowestNumberCell.col);
            setCurrentNumber(lowestNumberCell.number);
            // Find the direction of the clue corresponding to the lowestNumberCell number
            let lowestNumberDirection = 'across';
            const lowestNumber = lowestNumberCell.number;
            // Check across clues first
            const acrossClue = masterClues.across.find((clue) => clue.number === lowestNumber);
            if (acrossClue) {
                lowestNumberDirection = 'across';
            }
            else {
                // If not found in across, check down clues
                const downClue = masterClues.down.find((clue) => clue.number === lowestNumber);
                if (downClue) {
                    lowestNumberDirection = 'down';
                }
            }
            // Set the current direction to the direction of the lowest numbered clue
            setCurrentDirection(lowestNumberDirection);
            focus();
        }
    }, [masterClues, masterGridData]);
    (0, react_1.useEffect)(() => {
        if (guessesFromDB && guessesFromDB.length > 0) {
            (0, util_1.loadGuessesFromDB)(gridData, guessesFromDB);
        }
        setGridData(gridData);
    }, [guessesFromDB]);
    const handleCellClick = (0, react_1.useCallback)((cellData) => {
        var _a;
        if (cellData.used) {
            const { row, col } = cellData;
            const other = (0, util_1.otherDirection)(currentDirection);
            // should this use moveTo?
            setFocusedRow(row);
            setFocusedCol(col);
            let direction = currentDirection;
            // We switch to the "other" direction if (a) the current direction
            // isn't available in the clicked cell, or (b) we're already focused
            // and the clicked cell is the focused cell, *and* the other direction
            // is available.
            if (!cellData[currentDirection] ||
                (focused &&
                    row === focusedRow &&
                    col === focusedCol &&
                    cellData[other])) {
                setCurrentDirection(other);
                direction = other;
            }
            setCurrentNumber((_a = cellData[direction]) !== null && _a !== void 0 ? _a : '');
        }
        focus();
    }, [currentDirection, focus, focused, focusedCol, focusedRow]);
    const handleInputClick = (0, react_1.useCallback)(( /* event */) => {
        // *don't* event.preventDefault(), because we want the input to actually
        // take focus
        var _a;
        // Like general cell-clicks, cliking on the input can change direction.
        // Unlike cell clicks, we *know* we're clicking on the already-focused
        // cell!
        const other = (0, util_1.otherDirection)(currentDirection);
        const cellData = getCellData(focusedRow, focusedCol);
        let direction = currentDirection;
        if (focused && cellData[other]) {
            setCurrentDirection(other);
            direction = other;
        }
        setCurrentNumber((_a = cellData[direction]) !== null && _a !== void 0 ? _a : '');
        focus();
    }, [currentDirection, focus, focused, focusedCol, focusedRow, getCellData]);
    const handleClueSelected = (0, react_1.useCallback)((direction, number) => {
        const info = clues === null || clues === void 0 ? void 0 : clues[direction].find((clue) => clue.number === number);
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
    }, [clues, focus, moveTo, onClueSelected]);
    const registerFocusHandler = (0, react_1.useCallback)((focusHandler) => {
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
    }, []);
    // imperative commands...
    (0, react_1.useImperativeHandle)(ref, () => ({
        /**
         * Sets focus to the crossword component.
         */
        focus,
        /**
         * Resets the entire crossword; clearing all answers in the grid and
         * also any persisted data.
         */
        reset: () => {
            setGridData((0, immer_1.default)((draft) => {
                draft.forEach((rowData) => {
                    rowData.forEach((cellData) => {
                        if (cellData.used) {
                            cellData.guess = '';
                        }
                    });
                });
            }));
            setClues((0, immer_1.default)((draft) => {
                util_1.bothDirections.forEach((direction) => {
                    var _a;
                    (_a = draft === null || draft === void 0 ? void 0 : draft[direction]) === null || _a === void 0 ? void 0 : _a.forEach((clueInfo) => clueInfo);
                });
            }));
        },
        /**
         * Sets the “guess” character for a specific grid position.
         *
         * @since 4.1.0
         */
        setGuess: (row, col, guess) => {
            // REVIEW: should we force-case this?
            setCellCharacter(row, col, guess.toUpperCase());
        },
        /**
         * Returns the current grid data.
         */
        getGridData: () => gridData,
    }), [clues, focus, setCellCharacter, gridData]);
    const crosswordContext = (0, react_1.useMemo)(() => ({
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
    }), [
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
    ]);
    return ((0, jsx_runtime_1.jsx)(styled_components_1.ThemeProvider, Object.assign({ theme: finalTheme }, { children: (0, jsx_runtime_1.jsx)(context_1.CrosswordContext.Provider, Object.assign({ value: crosswordContext }, { children: children })) })));
});
exports.default = CrosswordProvider;
CrosswordProvider.displayName = 'CrosswordProvider';
CrosswordProvider.propTypes = exports.crosswordProviderPropTypes;
CrosswordProvider.defaultProps = {
    theme: undefined,
    allowMutation: true,
    onCellChange: undefined,
    onClueSelected: undefined,
    children: undefined,
};
//# sourceMappingURL=CrosswordProvider.js.map