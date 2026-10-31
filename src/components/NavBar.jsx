import { NavLink } from 'react-router-dom';

export const NavBar = () => {
    return (
        <div>
            <nav>
                <span>Novious</span>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/discover">Discover</NavLink>
                <NavLink to="/quiz">Quiz</NavLink>
                <NavLink to="/insights">Insights</NavLink>
            </nav>
        </div>
    );
}