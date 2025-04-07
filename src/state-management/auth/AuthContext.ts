import React from "react";
import { LogAction } from "./AuthProvider";

interface UserContextType {
  user: string;
  dispatch: React.Dispatch<LogAction>;
}

const AuthContext = React.createContext({} as UserContextType);

export default AuthContext;
