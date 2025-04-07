import { ReactNode, useReducer } from "react";
import AuthContext from "./AuthContext";

interface LogIn {
  type: "LOGIN";
  user: string;
}

interface LogOut {
  type: "LOGOUT";
}

export type LogAction = LogIn | LogOut;

const AuthReducer = (state: string, action: LogAction): string => {
  if (action.type === "LOGIN") return action.user;
  if (action.type === "LOGOUT") return "";
  return "";
};

interface Props {
  children: ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const [user, dispatch] = useReducer(AuthReducer, "");
  return (
    <AuthContext.Provider value={{ user, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
