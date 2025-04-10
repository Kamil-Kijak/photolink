import { useState } from 'react'
import {BrowserRouter, Routes, Route, Link} from "react-router-dom"
import MenuPage from "./MenuPage"

function App() {
  

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MenuPage></MenuPage>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
