import { useContext } from "react";
import AuthContext from "../contexts/UserContext";

const useAuth = () => useContext(AuthContext);

export default useAuth;
