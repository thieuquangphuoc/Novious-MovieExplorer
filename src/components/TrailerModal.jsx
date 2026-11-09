import { useEffect } from "react";
import { createPortal } from "react-dom";

/*
 * Full-screen player for a YouTube trailer.
 *
 * Rendering nothing when there is no key keeps every caller simple: they
 * hold one piece of state for the trailer being watched and pass it
 * straight in, instead of guarding the component with a conditional.
 *
 * Two details that are easy to miss:
 *
 * - The page behind is frozen while the player is open (overflow hidden on
 *   <body>), otherwise scrolling the wheel scrolls the film rows behind the
 *   dialog. The cleanup puts the old value back rather than hard-coding
 *   "auto", so it cannot clobber a different setting later on.
 * - Escape closes it. A dialog that can only be dismissed with the mouse is
 *   a trap for anyone on a keyboard.
 *
 * The backdrop closes on click, but the frame around the video calls
 * stopPropagation so clicking the player itself does not count as clicking
 * the backdrop.
 *
 * The whole thing is sent to <body> through a portal rather than rendered
 * where it is written. Every section that opens a trailer carries
 * `isolate`, which creates a stacking context, and z-index inside one of
 * those only ranks against its own siblings — so the player sat at z-100
 * inside the trailer strip and the next section down the page still
 * painted straight over it. A portal lifts it out of all of them, and it
 * fixes all three callers at once.
 */
const TrailerModal = ({ trailerKey, title, onClose }) => {
  useEffect(() => {
    if (!trailerKey) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [trailerKey, onClose]);

  if (!trailerKey) return null;

  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Trailer for ${title}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
    >
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-4xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="truncate text-lg font-semibold text-white">{title}</h2>

          <button
            onClick={onClose}
            aria-label="Close trailer"
            className="shrink-0 rounded-full bg-white/10 p-2 text-white transition hover:bg-[#E50914]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title={`Trailer for ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TrailerModal;
