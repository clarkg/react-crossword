import PropTypes from 'prop-types';
import Clue from './Clue';
import type { Direction, EnhancedProps, CluesData } from './types';

const directionCluesPropTypes = {
  /** direction of this list of clues ("across" or "down") */
  direction: PropTypes.string.isRequired,

  /** a label to use instead of the (English) default */
  label: PropTypes.string,

  clues: PropTypes.shape({
    across: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.string.isRequired,
        clue: PropTypes.string.isRequired,
      })
    ).isRequired,
    down: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.string.isRequired,
        clue: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export type DirectionCluesProps = EnhancedProps<
  typeof directionCluesPropTypes,
  { direction: Direction; clues: CluesData }
>;

export default function DirectionClues({
  direction,
  label,
  clues,
}: DirectionCluesProps) {
  return (
    <div className="direction">
      {/* use something other than h3? */}
      <h3 className="header">{label || direction.toUpperCase()}</h3>
      {clues?.[direction].map(({ number, clue }) => (
        <Clue key={number} direction={direction} number={number}>
          {clue}
        </Clue>
      ))}
    </div>
  );
}

DirectionClues.propTypes = directionCluesPropTypes;

DirectionClues.defaultProps = {
  label: undefined,
};
