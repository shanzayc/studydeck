import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        STUDYDECK
      </Link>

      <div className="nav-links">
        <Link to="/" className="nav-link">Sign Up</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/studyroom" className="nav-link">Study Room</Link>
        <Link to="/account" className="nav-link primary">My Account</Link>
      </div>
    </nav>
  );
}

export default Navbar;