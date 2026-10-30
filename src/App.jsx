import { useEffect } from 'react';

const KEY = '9a6d1d236017ab7b46940fcfab32fa0a'
const App = () => {
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${KEY}`)
    .then(res => res.json())
    .then(data => {
      console.log(data)
    })
  }, [])
  return (
    <div>
      <h1>Test Movie Database</h1>
    </div>
  );
}

export default App;