# Routing with React Router

## Content

-

## Keywords

# Setting Up Routing

```cmd

npm i react-router-dom@6.10.0
```

```tsx
// main
// ...
// ...

const queryClinet = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClinet}>
      <RouterProvider router={router} />
      {/* <App /> */}
      <ReactQueryDevtools />
    </QueryClientProvider>
  </React.StrictMode>
);
```

```tsx
// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";
import UserListPage from "./UserListPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/users", element: <UserListPage /> },
]);

export default router;
```

# Navigation

in order to load everything in the first load,

```tsx
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <p>...</p>
      <Link to="/users">Users</Link>
    </>
  );
};

export default HomePage;
```

```tsx
import { useNavigate } from "react-router-dom";

const ContactPage = () => {
  const navigate = useNavigate();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        navigate("/");
        // Redirect the user to the home page
      }}
    >
      <button className="btn btn-primary">Submit</button>
    </form>
  );
};

export default ContactPage;
```

# Passing Data with Route Parameters

```tsx
//
// ...

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/users", element: <UserListPage /> },
  { path: "/users/:id", element: <UserDetailPage /> },
  // you can pass many paramaeters
  // { path: "/posts/:year/:month", element: <UserListPage /> },
]);

export default router;
```

```tsx
import { Link } from "react-router-dom";

const UserListPage = () => {
  const users = [
    { id: 1, name: "Mosh" },
    { id: 2, name: "John" },
    { id: 3, name: "Alice" },
  ];
  return (
    <ul className="list-group">
      {users.map((user) => (
        <li className="list-group-item" key={user.id}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
          {/* <a href="#">{user.name}</a> */}
        </li>
      ))}
    </ul>
  );
};

export default UserListPage;
```

# Getting Data about the Current Route

```tsx
import { useLocation, useParams, useSearchParams } from "react-router-dom";

const UserDetailPage = () => {
  const params = useParams();
  console.log(params);
  // {id: '2'}
  // ps: that 2 value is a string be carefull

  const [searchParams, setSearchParams] = useSearchParams();
  // with this we can access and update the query string parameter
  console.log(searchParams); // URLSearchParams {size: 0}
  // not empty, this is the default way of rendering
  //
  // http://localhost:5173/users/2?name=alice&age=25
  // console.log(searchParams.toString()); // name=alice&age=25
  // console.log(searchParams.get("name")); // alice
  //
  // PS: our component should be pure, we should be carefull wehen using "setSearchParams"
  // we should call it only inside event handlers or inside an effect
  //

  const location = useLocation();
  // access the current location
  console.log(location);
  // {
  //   pathname: '/users/2',
  //   search: '?name=alice&age=25',
  //   hash: '',
  //   state: null,
  //   key: '4mf7y6pp'
  // }

  return <p>User</p>;
};

export default UserDetailPage;
```

# Nested Routes

```tsx
// routes.tsx
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";
import UserListPage from "./UserListPage";
import ContactPage from "./ContactPage";
import UserDetailPage from "./UserDetailPage";
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // PS: path to this routes should be relative to the path of theire parent
      // no need for a slash here

      // PS 2: since the string of the path is null, we remove that property
      // and add index prop to true, means if the user is on the location
      // of the parent, that's the default component that should be
      // rendered inside the outlet
      { index: true, element: <HomePage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "users", element: <UserListPage /> },
      { path: "users/:id", element: <UserDetailPage /> },
    ],
  },
]);

export default router;
```

```tsx
// Layout component (parent component)
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
```

```tsx
// NavBar component
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{ background: "#f0f0f0", marginBottom: "1rem" }}
    >
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          My App
        </a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              {/* we have to replace the anchors with Link component 
              <a className="nav-link active" href="#">
                Home
              </a> */}
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/users" className="nav-link">
                Users
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
```

# Exercice: Working with Nested Routes

```tsx

```

# Styling the Active Link

```tsx
// ul element in the Nav component
<ul className="navbar-nav">
  <li className="nav-item">
    {/* we have to replace the anchors with Link component
              <a className="nav-link active" href="#">
                Home
              </a> */}
    {/* in case you want to change the name of the active class */}
    <NavLink
      to="/"
      className={({ isActive }) => (isActive ? "active nav-link" : "nav-link")}
    >
      Home
    </NavLink>
  </li>
  <li className="nav-item">
    <NavLink to="/users" className="nav-link">
      Users
    </NavLink>
  </li>
</ul>
```

# Handling Errors

```tsx
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";
import UserListPage from "./UserListPage";
import ContactPage from "./ContactPage";
import UserDetailPage from "./UserDetailPage";
import Layout from "./Layout";
import ErrorPage from "./ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />, // handle not found errors
    children: [
      // ....
    ],
  },
]);

export default router;
```

```tsx
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  // we use this hook to get the error that was thrown
  // PS: in real world app we want to log this somewhere permanent using
  // a log service, for now will use the console
  const error = useRouteError();
  console.log(error);

  return (
    <>
      <h1>Oops...</h1>
      <p>
        {/* to tell the user this page donesn't exist
         if true, user tried to access invalid browser */}
        {isRouteErrorResponse(error)
          ? "Invalid Page"
          : "Sorry, an unexpected error has occurred."}
      </p>
    </>
  );
};

export default ErrorPage;
```

# Private Routes

```tsx
// useAuth.ts
// this is just a demo it is not a real world example
// const useAuth = () => ({ user: { id: 1, name: 'Mosh' } });

const useAuth = () => ({ user: null });

export default useAuth;
```

```tsx
// UserPage
const UsersPage = () => {
  const { user } = useAuth();

  // in this case rediracte the user to the log-in page
  // not with the navigate func since it has a side effect
  // it updates the url in the browser, we can't call it in
  // the render phase, otherwise this component won't be pure
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="row">
      <div className="col">
        <UserList />
      </div>
      <div className="col">
        <Outlet />
      </div>
    </div>
  );
};

export default UsersPage;
```

```tsx
// routes.tsx
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
      {
        path: "users",
        element: <UsersPage />,
        children: [{ path: ":id", element: <UserDetail /> }],
      },
    ],
  },
]);
export default router;
```

# Layout Routes

Sometimes we need to group routes for enforcing layouts or buissnes rules, this is where we can use the `Layout` routes.

```tsx
import useAuth from "./hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return <Outlet />;
};

export default PrivateRoutes;
```

```tsx
import { Outlet } from "react-router-dom";
import UserList from "./UserList";

const UsersPage = () => {
  // const { user } = useAuth();
  // if (!user) return <Navigate to={"/login"} />;

  return (
    <div className="row">
      <div className="col">
        <UserList />
      </div>
      <div className="col">
        <Outlet />
      </div>
    </div>
  );
};

export default UsersPage;
```

```tsx
// Routes
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
```
