import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const Layout = () => {
  return (
    <>
      <NavBar />
      <div id="main">
        <Outlet />
        {/* Outlet is like a placeholder for a child component */}
      </div>
    </>
  );
};

export default Layout;
