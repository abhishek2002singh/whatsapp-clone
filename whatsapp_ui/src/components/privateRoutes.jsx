
import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

const PrivateRoute = ({ children }) => {
  const valid = isTokenValid();
 

  if (!valid) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
