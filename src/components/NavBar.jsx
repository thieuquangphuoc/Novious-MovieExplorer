import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const navbarContent = [
    { path: "/", title: "Home" },
    { path: "/discover", title: "Discover" },
    { path: "/quiz", title: "Quiz" },
    { path: "/insights", title: "Insights" }
];

/*
 * Navigation bar.
 *
 * It is fixed and fully transparent at the top of a page, so it floats over
 * the hero artwork instead of cutting a black band across it. A soft
 * top-down gradient is the only backing: enough to keep white text legible
 * over a bright still, invisible as a bar.
 *
 * Once the page scrolls past the first few pixels the bar turns solid, with
 * a blur and a hairline border. Without that it would end up as white text
 * floating over poster rows further down the page.
 *
 * NavLink hands us isActive, which marks the current page in red so the
 * visitor always knows where they are.
 *
 * On narrow screens the two rows stack; from sm upwards they sit side by
 * side. Forcing a single row at every width used to glue the logo to the
 * menu on a phone.
 */
export const NavBar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();                                     // correct state as soon as the page opens
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                scrolled
                    ? "border-b border-white/10 bg-[#141414]/95 backdrop-blur"
                    : "border-b border-transparent bg-gradient-to-b from-black/70 to-transparent"
            }`}
        >
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-between sm:px-6 sm:py-4 lg:px-8">
                <NavLink
                    to="/"
                    className="font-display text-3xl tracking-[0.15em] text-white transition-colors hover:text-[#E50914]"
                >
                    NOVIOUS
                </NavLink>

                <div className="flex items-center gap-5 sm:gap-8">
                    {navbarContent.map((item) => {
                        return (
                            <NavLink
                                to={item.path}
                                key={item.path}
                                className={({ isActive }) =>
                                    `text-sm font-medium tracking-wide transition-colors hover:text-[#E50914] ${
                                        isActive ? "text-[#E50914]" : "text-neutral-200"
                                    }`
                                }
                            >
                                {item.title}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
