import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeContext } from 'styled-components';

import type { Direction, EnhancedProps } from './types';
import { CrosswordContext } from './context';

interface ClueWrapperProps {
  highlight?: boolean | null;
  highlightBackground?: string | null;
}

const ClueWrapper = styled.div.attrs<ClueWrapperProps>(() => ({
  className: `clue${''}`,
}))<ClueWrapperProps>`
  cursor: default;
  background-color: ${(props) =>
    props.highlight ? props.highlightBackground : 'transparent'};
`;

/**
 * Renders an individual clue, with its number. Makes use of `CrosswordContext`
 * to know whether to render as “highlighted” or not, and uses the theme to
 * provide the highlighting color.
 */
export default function Clue({
  direction,
  number,
  children,
  ...props
}: EnhancedProps<
  typeof Clue.propTypes,
  {
    /** direction of the clue: “across” or “down”; passed back in onClick */
    direction: Direction;
  }
>) {
  const { highlightBackground } = useContext(ThemeContext);
  const { focused, selectedDirection, selectedNumber, handleClueSelected } =
    useContext(CrosswordContext);

  const handleClick = useCallback<React.MouseEventHandler>(
    (event) => {
      event.preventDefault();
      handleClueSelected(direction, number);
    },
    [direction, number, handleClueSelected]
  );

  return (
    <ClueWrapper
      highlightBackground={highlightBackground}
      highlight={
        focused && direction === selectedDirection && number === selectedNumber
      }
      {...props}
      onClick={handleClick}
      aria-label={`clue-${number}-${direction}`}
    >
      {number}: {children}
    </ClueWrapper>
  );
}

Clue.propTypes = {
  /** direction of the clue: "across" or "down"; passed back in onClick */
  direction: PropTypes.string.isRequired,
  /** number of the clue (the label shown); passed back in onClick */
  number: PropTypes.string.isRequired,
  /** clue text */
  children: PropTypes.node.isRequired,
};
