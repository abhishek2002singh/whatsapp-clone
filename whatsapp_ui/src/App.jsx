import { Routes, Route } from "react-router-dom";


import Body from "./components/Body";
import PrivateRoute from "./components/privateRoutes";
import LoginPage from "./authPage/LoginPage";
import SignupPage from "./authPage/SignupPage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { addUser, clearUser } from "./utils/userSlice";
import { isTokenValid } from "./utils/auth";
import GroupMaking from "./groupMAking/GroupMaking";



function App() {

  const dispatch = useDispatch();


  useEffect(() => {
    const { valid , user } = isTokenValid(); 
    console.log("kakkakak",user)
     if (valid && user) {
      dispatch(addUser(user)); // Restore user into Redux

    } else {
      dispatch(clearUser());
      localStorage.removeItem("token");
    }
    
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<PrivateRoute><Body /></PrivateRoute>} >
      <Route path="/GroupMaking" element={<GroupMaking />} />

      </Route>
     
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
      
    </Routes>
  );
}

export default App;
