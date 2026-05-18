/* src/pages/Logout.tsx ---------------------------------------------------- */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/authSlice";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* run once on mount */
  useEffect(() => {
    dispatch(logout()); // ⟵ Redux
    localStorage.removeItem("user"); // ⟵ any leftovers
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  return null; // nothing to render
}
