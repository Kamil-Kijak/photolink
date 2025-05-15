
import {BrowserRouter, Routes, Route} from "react-router-dom"

import TitlePage from "./Sections/TitlePage"
import EnterPage from "./Sections/EnterPage"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitlePage></TitlePage>}></Route>
        <Route path="/enter" element={<EnterPage></EnterPage>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
