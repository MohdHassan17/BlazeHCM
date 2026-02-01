import { Navigate, Outlet } from "react-router-dom"
import useAuth from "../hooks/use-auth"

const AuthRequiredRoutes = () => {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default AuthRequiredRoutes