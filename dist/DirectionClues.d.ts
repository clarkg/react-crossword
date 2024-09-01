/// <reference types="react" />
import PropTypes from 'prop-types';
import type { Direction, EnhancedProps, CluesData } from './types';
declare const directionCluesPropTypes: {
    /** direction of this list of clues ("across" or "down") */
    direction: PropTypes.Validator<string>;
    /** a label to use instead of the (English) default */
    label: PropTypes.Requireable<string>;
    clues: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
        across: PropTypes.Validator<PropTypes.InferProps<{
            number: PropTypes.Validator<string>;
            clue: PropTypes.Validator<string>;
        }>[]>;
        down: PropTypes.Validator<PropTypes.InferProps<{
            number: PropTypes.Validator<string>;
            clue: PropTypes.Validator<string>;
        }>[]>;
    }>>>;
};
export type DirectionCluesProps = EnhancedProps<typeof directionCluesPropTypes, {
    direction: Direction;
    clues: CluesData;
}>;
declare function DirectionClues({ direction, label, clues, }: DirectionCluesProps): JSX.Element;
declare namespace DirectionClues {
    var propTypes: {
        /** direction of this list of clues ("across" or "down") */
        direction: PropTypes.Validator<string>;
        /** a label to use instead of the (English) default */
        label: PropTypes.Requireable<string>;
        clues: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
            across: PropTypes.Validator<PropTypes.InferProps<{
                number: PropTypes.Validator<string>;
                clue: PropTypes.Validator<string>;
            }>[]>;
            down: PropTypes.Validator<PropTypes.InferProps<{
                number: PropTypes.Validator<string>;
                clue: PropTypes.Validator<string>;
            }>[]>;
        }>>>;
    };
    var defaultProps: {
        label: any;
    };
}
export default DirectionClues;
