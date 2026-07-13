import './App.css'
import {BrowserRouter, Routes, Route, Link}
from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Mypage from './pages/Mypage.jsx'

function App() {
  return (
    <>
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/about">About</Link>
        {' | '}
        <Link to="/mypage">My Page</Link>
      </nav>

      <Routes>
        <Route path="/" element=
        {<Home/>}/>
        <Route path="/about" element=
        {<About/>}/>
        <Route path="/Mypage" element=
        {<Mypage/>}/>
      </Routes>
    </BrowserRouter>

    </>
  )
}
export default App
