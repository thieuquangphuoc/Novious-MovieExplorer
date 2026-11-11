import { useEffect } from "react";
import { createPortal } from "react-dom";

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
