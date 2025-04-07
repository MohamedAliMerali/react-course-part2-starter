import useAuthStore from "./store";

const LoginStatus = () => {
  // const [user, setUser] = useState("");
  // const [user, dispatch] = useReducer(AuthReducer, "");
  // const { user, dispatch } = useAuth();
  const { user, login, logout } = useAuthStore();

  if (user)
    return (
      <>
        <div>
          <span className="mx-2">{user}</span>
          {/* <a onClick={() => dispatch({ type: "LOGOUT" })} href="#"> */}
          <a onClick={() => logout()} href="#">
            Logout
          </a>
        </div>
      </>
    );
  return (
    <div>
      <a
        // onClick={() => dispatch({ type: "LOGIN", user: "mosh.hamedani" })}
        onClick={() => login("mosh.hamedani")}
        href="#"
      >
        Login
      </a>
    </div>
  );
};

export default LoginStatus;
