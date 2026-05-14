import { Navigate } from 'react-router-dom';
import { getCurrentUserToken } from '../services/auth';

const ProtectedRoute = ({ children }) => {
  const token = getCurrentUserToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
