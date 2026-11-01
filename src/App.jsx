import { useEffect } from 'react';
import { getTrending } from './services/api';
import { Routes, Route } from 'react-router-dom';

import { NavBar } from './components/NavBar';

import Home from './pages/Home';
import Discover from './pages/Discover';
import Quiz from './pages/Quiz';
import Insights from './pages/Insights';

const eachElement = [
  { path: "/", element: <Home/>},
  { path: "/discover", element: <Discover/>},
  { path: "/quiz", element: <Quiz/>},
  { path: "/insights", element: <Insights/>},
];


const App = () => {
  useEffect(() => {
    const loadMovies = async () => {
      const res = await getTrending();
      console.log(res);
    }
    loadMovies();
  }, []);

  return (
    <div>
      <NavBar/>
      <Routes>{eachElement.map((item) => {
        return (
          <Route key={item.path} path={item.path} element={item.element}/>
        );
      })}</Routes>
    </div>
  );
};

export default App;