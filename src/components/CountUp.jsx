import { useEffect, useRef } from "react";
import { CountUp as CountUpAnimation } from "countup.js";

/*
 * Animates a number from 0 up to `end` when the component mounts.
 *
 * countup.js does the animation itself (easing, thousands separators,
 * decimals); this component only owns the <span> it writes into and the
 * React lifecycle around it. The official react-countup wrapper was tried
 * first but did not animate in the production build, so the wrapper is
 * written here instead — it is small enough to read in one sitting.
 *
 * The <span> is rendered empty: countup.js writes the start value into it
 * as soon as the instance is created in the effect below.
 */
const CountUp = ({ end, duration = 2, decimals = 0, suffix = "" }) => {
  const spanRef = useRef(null);

  useEffect(() => {
    const animation = new CountUpAnimation(spanRef.current, end, {
      duration,
      decimalPlaces: decimals,
      suffix,
    });
    animation.start();

    // Stop and clear the old animation before a new one is created,
    // so switching between Today / This week never leaves a half-run count.
    return () => animation.reset();
  }, [end, duration, decimals, suffix]);

  return <span ref={spanRef} />;
};

export default CountUp;
