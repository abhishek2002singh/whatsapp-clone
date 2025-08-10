
import { jwtDecode } from "jwt-decode";

export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    console.log(decoded)
    const currentTime = Date.now() / 1000;
    if(decoded.exp > currentTime){
        return { valid: true, user: decoded };
    }
  } catch (err) {
    return false;
  }
};
