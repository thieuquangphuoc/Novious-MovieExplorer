/*
 * react-countup ships as a CommonJS module. Vite 8 converts it to ES module
 * form incorrectly: the default import arrives as the module object
 * ({ default, useCountUp }) instead of the component function, and React then
 * throws "Element type is invalid ... got: object".
 *
 * Unwrapping it once here keeps the workaround in a single place, and the
 * `??` fallback means the app still works if the bundler is fixed later.
 */
import * as countUpModule from "react-countup";

const CountUp = countUpModule.default?.default ?? countUpModule.default;

export default CountUp;
