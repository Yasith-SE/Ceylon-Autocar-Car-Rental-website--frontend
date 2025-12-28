import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./Pages/Home"
import AvailableCars from "./Pages/AvailableCars"
import Login from "./Pages/Login"
import SignUp from "./Pages/SignUp"
function App() {
 
  return (
  
      <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/available" element={<AvailableCars />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>

  )
}
export default App
