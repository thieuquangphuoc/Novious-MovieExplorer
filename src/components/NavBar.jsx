import { NavLink } from 'react-router-dom';

export const NavBar = () => {
    return (
        <div>
            <nav className="flex items-center justify-between bg-red-900 px-6 py-4 text-white">
                <span className="text-xl font-bold text-amber-200 hover:bg-neutral-400">Novious</span>
                <div className="flex gap-6">
                    <NavLink to="/" className="hover:text-amber-200">Home</NavLink>
                    <NavLink to="/discover" className="hover:text-amber-200">Discover</NavLink>
                    <NavLink to="/quiz" className="hover:text-amber-200">Quiz</NavLink>
                    <NavLink to="/insights" className="hover:text-amber-200">Insights</NavLink>
                </div>
            </nav>
        </div>
    );
}