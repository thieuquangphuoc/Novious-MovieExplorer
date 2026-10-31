import { useEffect } from 'react';
import { getTrending } from './services/api';
import { Routes, Route } from 'react-router-dom';

import { NavBar } from './components/NavBar';

import Home from './pages/Home';
import Discover from './pages/Discover';
import Quiz from './pages/Quiz';
import Insights from './pages/Insights';

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
      <Routes>

        <Route path="/" element={<Home/>}/>
        <Route path="/discover" element={<Discover/>}/>
        <Route path="/quiz" element={<Quiz/>}/>
        <Route path="/insights" element={<Insights/>}/>

      </Routes>
    </div>
  );
};

export default App;