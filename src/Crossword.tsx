import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';

// import produce from 'immer';
import styled from 'styled-components';

import { EnhancedProps } from './types';

import CrosswordProvider, {
  CrosswordProviderImperative,
  CrosswordProviderProps,
  crosswordProviderPropTypes,
} from './CrosswordProvider';
import CrosswordGrid from './CrosswordGrid';

// interface OuterWrapperProps {
//   correct?: boolean;
// }

// const OuterWrapper = styled.div.attrs<OuterWrapperProps>((props) => ({
//   className: `crossword${props.correct ? ' correct' : ''}`,
// }))<OuterWrapperProps>`
//   margin: 0;
//   padding: 0;
//   border: 0;
//   /* position: relative; */
//   /* width: 40%; */
//   display: flex;
//   flex-direction: row;

//   @media (max-width: ${(props) => props.theme.columnBreakpoint}) {
//     flex-direction: column;
//   }
// `;

const CluesWrapper = styled.div.attrs((/* props */) => ({
  className: 'clues',
}))`
  padding: 0 1em;
  flex: 1 2 25%;

  @media (max-width: ${(props) => props.theme.columnBreakpoint}) {
    margin-top: 2em;
  }

  .direction {
    margin-bottom: 2em;
    /* padding: 0 1em;
    flex: 1 1 20%; */

    .header {
      margin-top: 0;
      margin-bottom: 0.5em;
    }

    div {
      margin-top: 0.5em;
    }
  }
`;

const crosswordPropTypes = {
  ...crosswordProviderPropTypes,

  /** the label for the "across" clues */
  acrossLabel: PropTypes.string,

  /** the label for the "down" clues */
  downLabel: PropTypes.string,
};

delete crosswordPropTypes.children;

// This somewhat non-obvious construction is to get the typings from
// CrosswordProvider where they are "better" than the default inferred types.
export type CrosswordProps = EnhancedProps<
  typeof crosswordPropTypes,
  Omit<CrosswordProviderProps, 'children'>
>;
export type CrosswordImperative = CrosswordProviderImperative;

/**
 * The default export from the react-crossword library, `Crossword` renders an
 * answer grid and clues in a basic layout and provides access to most
 * functionality.
 */
const Crossword = React.forwardRef<CrosswordImperative, CrosswordProps>(
  ({ ...props }, ref) => {
    const providerRef = useRef<CrosswordProviderImperative>(null);

    // expose some imperative methods
    useImperativeHandle(
      ref,
      () => ({
        /**
         * Sets focus to the crossword component.
         */
        focus: () => providerRef.current?.focus(),

        /**
         * Resets the entire crossword; clearing all answers in the grid and
         * also any persisted data.
         */
        reset: () => providerRef.current?.reset(),

        /**
         * Sets the “guess” character for a specific grid position.
         *
         * @since 4.1.0
         */
        setGuess: (row: number, col: number, guess: string) =>
          providerRef.current?.setGuess(row, col, guess),

        /**
         * Returns the current grid data.
         */
        getGridData: () => providerRef.current!.getGridData(),
      }),
      [providerRef]
    );

    return (
      <CrosswordProvider {...props} ref={providerRef}>
        <CrosswordGrid gridData={providerRef.current!.getGridData()} />
        <CluesWrapper />
      </CrosswordProvider>
    );
  }
);

Crossword.displayName = 'Crossword';

// @ts-expect-error idk
Crossword.propTypes = crosswordPropTypes;
Crossword.defaultProps = {
  ...CrosswordProvider.defaultProps,
  acrossLabel: undefined,
  downLabel: undefined,
};

export default Crossword;
