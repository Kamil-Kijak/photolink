
import {BrowserRouter, Routes, Route} from "react-router-dom"

import TitlePage from "./Sections/TitlePage"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitlePage></TitlePage>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
