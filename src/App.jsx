import { Routes, Route } from 'react-router-dom';

import { NavBar } from './components/layout/NavBar';
import Footer from './components/layout/Footer';

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

      <Footer/>
    </div>
  );
};

export default App;
