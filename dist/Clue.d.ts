/// <reference types="react" />
import PropTypes from 'prop-types';
import type { Direction, EnhancedProps } from './types';
/**
 * Renders an individual clue, with its number. Makes use of `CrosswordContext`
 * to know whether to render as “highlighted” or not, and uses the theme to
 * provide the highlighting color.
 */
declare function Clue({ direction, number, children, ...props }: EnhancedProps<typeof Clue.propTypes, {
    /** direction of the clue: “across” or “down”; passed back in onClick */
    direction: Direction;
}>): JSX.Element;
declare namespace Clue {
    var propTypes: {
        /** direction of the clue: "across" or "down"; passed back in onClick */
        direction: PropTypes.Validator<string>;
        /** number of the clue (the label shown); passed back in onClick */
        number: PropTypes.Validator<string>;
        /** clue text */
        children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
    };
}
export default Clue;
