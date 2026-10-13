// src/components/NavBarLogin.jsx
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between">
      <Link to="/" className="font-bold text-xl">CineList</Link>
    </nav>
      
    
  );
}

export default Navbar;