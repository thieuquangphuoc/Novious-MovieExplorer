import { NavLink } from 'react-router-dom';

const navbarContent = [
    { path: "/", title: "Home" },
    { path: "/discover", title: "Discover" },
    { path: "/quiz", title: "Quiz" },
    { path: "/insights", title: "Insights" }
];

export const NavBar = () => {
    return (
        <div>
            <nav className="flex items-center justify-between bg-red-900 px-6 py-4 text-white">
                <span className="text-xl font-bold text-amber-200 hover:bg-neutral-400">Novious</span>
                <div className="flex gap-6">
                    {navbarContent.map((item) => {
                        return (
                            <NavLink to={item.path} key={item.path} className="hover:text-amber-500">
                                {item.title}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}