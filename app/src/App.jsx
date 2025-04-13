
import {useCallback, useState} from "react"
import {BrowserRouter, Routes, Route, Link} from "react-router-dom"
import MenuPage from "./MenuPage"
import MainPanel from "./MainPanel"

function App() {
  const [user, setUser] = useState(null);
  const setUserCallback = useCallback((ID) => {
    setUser(ID);
  })

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MenuPage setUser={setUserCallback}></MenuPage>}/>
        <Route path='/app' element={<MainPanel></MainPanel>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
