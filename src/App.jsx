import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./Pages/Home"
import AvailableCars from "./Pages/AvailableCars"
function App() {
 
  return (
  
      <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/available" element={<AvailableCars />} />
      </Routes>
    </BrowserRouter>

  )
}
export default App
