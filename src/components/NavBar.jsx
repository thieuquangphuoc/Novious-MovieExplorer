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
 * The background is the same #141414 as the page and the hero, so the top
 * of the site reads as one surface; only a faint bottom border separates it
 * from the content. sticky top-0 keeps it in view while scrolling, and
 * backdrop-blur softens whatever passes underneath.
 *
 * NavLink hands us isActive, which marks the current page in red so the
 * visitor always knows where they are.
 *
 * On narrow screens the two rows stack; from sm upwards they sit side by
 * side. Forcing a single row at every width used to glue the logo to the
 * menu on a phone.
 */
export const NavBar = () => {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#141414]/95 backdrop-blur">
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
                                        isActive ? "text-[#E50914]" : "text-neutral-300"
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
