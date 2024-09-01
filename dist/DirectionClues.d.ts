/// <reference types="react" />
import PropTypes from 'prop-types';
import type { Direction, EnhancedProps } from './types';
declare const directionCluesPropTypes: {
    /** direction of this list of clues ("across" or "down") */
    direction: PropTypes.Validator<string>;
    /** a label to use instead of the (English) default */
    label: PropTypes.Requireable<string>;
    clues: PropTypes.Validator<PropTypes.InferProps<{
        number: PropTypes.Validator<string>;
        clue: PropTypes.Validator<string>;
        correct: PropTypes.Requireable<boolean>;
    }>[]>;
};
export type DirectionCluesProps = EnhancedProps<typeof directionCluesPropTypes, {
    direction: Direction;
}>;
declare function DirectionClues({ direction, label, clues, }: DirectionCluesProps): JSX.Element;
declare namespace DirectionClues {
    var propTypes: {
        /** direction of this list of clues ("across" or "down") */
        direction: PropTypes.Validator<string>;
        /** a label to use instead of the (English) default */
        label: PropTypes.Requireable<string>;
        clues: PropTypes.Validator<PropTypes.InferProps<{
            number: PropTypes.Validator<string>;
            clue: PropTypes.Validator<string>;
            correct: PropTypes.Requireable<boolean>;
        }>[]>;
    };
    var defaultProps: {
        label: any;
    };
}
export default DirectionClues;
