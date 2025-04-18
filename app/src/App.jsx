
import { useCallback, useState, createContext, useContext} from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import {io} from "socket.io-client"

import MenuPage from "./MenuPage"
import ForYou from "./sections/ForYou"
import Explore from "./sections/Explore"
import Notifications from "./sections/Notifications"
import Create from "./sections/Create"
import Profile from "./sections/Profile"


function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(io("localhost:3000"))
  const setUserCallback = useCallback((ID) => {
    setUser(ID);
    socket.emit("register", ID);
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MenuPage setUser={setUserCallback}></MenuPage>}/>
        <Route path='/app' element={<ForYou IDUser={user}></ForYou>}/>
        <Route path='/explore' element={<Explore></Explore>}/>
        <Route path='/notifications' element={<Notifications></Notifications>}/>
        <Route path='/create' element={<Create></Create>}/>
        <Route path='/profile/:id' element={<Profile socket={socket} userID={user}></Profile>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
