var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const prop_types_1 = __importDefault(require("prop-types"));
const Clue_1 = __importDefault(require("./Clue"));
const directionCluesPropTypes = {
    /** direction of this list of clues ("across" or "down") */
    direction: prop_types_1.default.string.isRequired,
    /** a label to use instead of the (English) default */
    label: prop_types_1.default.string,
    clues: prop_types_1.default.shape({
        across: prop_types_1.default.arrayOf(prop_types_1.default.shape({
            number: prop_types_1.default.string.isRequired,
            clue: prop_types_1.default.string.isRequired,
        })).isRequired,
        down: prop_types_1.default.arrayOf(prop_types_1.default.shape({
            number: prop_types_1.default.string.isRequired,
            clue: prop_types_1.default.string.isRequired,
        })).isRequired,
    }).isRequired,
};
function DirectionClues({ direction, label, clues, }) {
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "direction" }, { children: [(0, jsx_runtime_1.jsx)("h3", Object.assign({ className: "header" }, { children: label || direction.toUpperCase() })), clues === null || clues === void 0 ? void 0 : clues[direction].map(({ number, clue }) => ((0, jsx_runtime_1.jsx)(Clue_1.default, Object.assign({ direction: direction, number: number }, { children: clue }), number)))] })));
}
exports.default = DirectionClues;
DirectionClues.propTypes = directionCluesPropTypes;
DirectionClues.defaultProps = {
    label: undefined,
};
//# sourceMappingURL=DirectionClues.js.map