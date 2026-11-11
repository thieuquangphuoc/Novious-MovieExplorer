import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const navbarContent = [
    { path: "/", title: "Home" },
    { path: "/discover", title: "Discover" },
    { path: "/quiz", title: "Quiz" },
    { path: "/insights", title: "Insights" }
];

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
                    className="group flex items-center gap-2.5 text-white transition-colors hover:text-[#E50914]"
                >
                    
                    <img
                        src={`${import.meta.env.BASE_URL}logo-96.png`}
                        alt=""
                        className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="font-display text-3xl tracking-[0.15em]">NOVIOUS</span>
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
