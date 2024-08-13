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

export default AuthReducer;
