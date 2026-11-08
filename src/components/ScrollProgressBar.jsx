import { useState, useEffect, useRef, useCallback } from "react";

const MIN_THUMB = 0.08;   // never let the handle shrink to a dot

/*
 * A scrollbar for a horizontal strip, drawn by hand.
 *
 * The strips on this page hide their native scrollbar, which looks clean
 * but hides the fact that there is more to see: on a trackpad you can
 * already swipe sideways, yet nothing on screen says so, and the arrows
 * only appear on hover. This bar is the missing signal — and it is not
 * only a signal, it can be dragged like a real scrollbar.
 *
 * Why not just show the native one? On macOS overlay scrollbars fade out
 * while idle, which is exactly when the hint is needed, and what is left
 * cannot be styled to match the rest of the page.
 *
 * `watch` exists because a ResizeObserver on the strip only fires when the
 * strip's own box changes. Swapping tab replaces the cards inside it, so
 * scrollWidth changes while clientWidth does not; passing the tab through
 * `watch` re-measures at that moment.
 */
const ScrollProgressBar = ({ trackRef, watch, className = "" }) => {
  const [thumb, setThumb] = useState({ size: 1, offset: 0 });
  const barRef = useRef(null);
  const dragging = useRef(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const scrollable = track.scrollWidth - track.clientWidth;
    const size = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;
    const offset = scrollable > 0 ? track.scrollLeft / scrollable : 0;

    setThumb({ size: Math.min(1, size), offset });
  }, [trackRef]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    measure();
    track.addEventListener("scroll", measure, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure, trackRef, watch]);

  /*
   * Turn a pointer position on the bar into a scroll position.
   *
   * The handle is centred on the pointer, so the usable span of the bar is
   * its width minus the handle; dividing by that span keeps the far right
   * of the bar meaning the far right of the strip.
   *
   * scrollBehavior is forced to auto for the duration: the strip is set to
   * scroll smoothly for the arrow buttons, and that easing applied to every
   * mousemove turns a drag into a lagging rubber band.
   */
  const scrollToPointer = (clientX) => {
    const bar = barRef.current;
    const track = trackRef.current;
    if (!bar || !track) return;

    const rect = bar.getBoundingClientRect();
    const handleWidth = rect.width * Math.max(thumb.size, MIN_THUMB);
    const span = rect.width - handleWidth;
    if (span <= 0) return;

    const ratio = Math.min(1, Math.max(0, (clientX - rect.left - handleWidth / 2) / span));

    const previous = track.style.scrollBehavior;
    track.style.scrollBehavior = "auto";
    track.scrollLeft = ratio * (track.scrollWidth - track.clientWidth);
    track.style.scrollBehavior = previous;
  };

  const onPointerDown = (event) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollToPointer(event.clientX);
  };

  const onPointerMove = (event) => {
    if (!dragging.current) return;
    scrollToPointer(event.clientX);
  };

  const endDrag = (event) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // everything fits on screen, so there is nothing to scroll and nothing to show
  if (thumb.size >= 1) return null;

  const size = Math.max(thumb.size, MIN_THUMB);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="presentation"
      className={`group/bar h-4 cursor-pointer touch-none select-none ${className}`}
    >
      {/* barRef belongs on THIS element, not the padded wrapper above it.
          The handle is positioned as a percentage of this inner rail, so
          measuring the wrapper instead would read a box wider by its own
          horizontal padding and every drag would land short. */}
      <div ref={barRef} className="relative top-1.5 h-1 w-full rounded-full bg-white/10">
        <div
          className="absolute top-0 h-full rounded-full bg-white/35 transition-colors duration-200 group-hover/bar:bg-[#E50914]"
          style={{
            width: `${size * 100}%`,
            left: `${thumb.offset * (100 - size * 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ScrollProgressBar;
