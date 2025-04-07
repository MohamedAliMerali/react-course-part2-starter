import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import HomePage from "./HomePage";
import Layout from "./Layout";
import LoginPage from "./LoginPage";
import PrivateRoutes from "./PrivateRoutes";
import UserDetail from "./UserDetail";
import UsersPage from "./UsersPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />, // handle not found errors
    children: [
      // PS: path to this routes should be relative to the path of theire parent
      // no need for a slash here

      // PS 2: since the string of the path is null, we remove that property
      // and add index prop to true, means if the user is on the location
      // of the parent, that's the default component that should be
      // rendered inside the outlet
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
  {
    // no need to set path, this is a layout route, its purpose
    // is to group routes for enforcing layout or buissnes rules
    element: <PrivateRoutes />,
    children: [
      {
        path: "users",
        element: <UsersPage />,
        children: [{ path: ":id", element: <UserDetail /> }],
      },
    ],
  },
]);

export default router;
