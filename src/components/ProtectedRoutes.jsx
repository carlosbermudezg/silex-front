import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = ({ isAuth }) => {
  if (!isAuth) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;