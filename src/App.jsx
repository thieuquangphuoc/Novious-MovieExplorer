import { Routes, Route } from 'react-router-dom';

import { NavBar } from './components/NavBar';

import Home from './pages/Home';
import Discover from './pages/Discover';
import Quiz from './pages/Quiz';
import Insights from './pages/Insights';
import MovieDetail from './pages/MovieDetail';

const eachElement = [
  { path: "/", element: <Home/>},
  { path: "/discover", element: <Discover/>},
  { path: "/quiz", element: <Quiz/>},
  { path: "/insights", element: <Insights/>},
  { path: "/movie/:id", element: <MovieDetail/>},
];


const App = () => {
  return (
    <div className="min-h-screen bg-[#141414]">
      <NavBar/>
      <Routes>{eachElement.map((item) => {
        return (
          <Route key={item.path} path={item.path} element={item.element}/>
        );
      })}</Routes>

      {/* TMDB yeu cau ghi attribution o moi noi dung dung du lieu cua ho */}
      <footer className="mt-16 border-t border-neutral-800 px-4 py-8 text-center text-xs text-neutral-500">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </footer>
    </div>
  );
};

export default App;
