import { useEffect, useRef } from "react";
import { CountUp as CountUpAnimation } from "countup.js";

const CountUp = ({ end, duration = 2, decimals = 0, suffix = "" }) => {
  const spanRef = useRef(null);

  useEffect(() => {
    const animation = new CountUpAnimation(spanRef.current, end, {
      duration,
      decimalPlaces: decimals,
      suffix,
    });
    animation.start();

    return () => animation.reset();
  }, [end, duration, decimals, suffix]);

  return <span ref={spanRef} />;
};

export default CountUp;
