import { useState, useEffect, useRef } from "react";

/*
 * Reveals its children once they scroll into view.
 *
 * An IntersectionObserver rather than a scroll listener: the browser does
 * the work off the main thread and only calls back when something
 * actually crosses the edge, where a scroll handler would run on every
 * frame of every scroll for the whole page.
 *
 * It disconnects after the first hit. These are entrances, not a state
 * the element should return to — re-hiding a chart when it leaves the
 * viewport would mean it animates again every time you scroll past, which
 * is irritating rather than elegant.
 *
 * rootMargin pulls the trigger line up from the bottom edge, so the
 * movement finishes as the element arrives rather than starting the
 * moment its first pixel appears.
 */
const Reveal = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;
