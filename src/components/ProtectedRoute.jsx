import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase'; // Ensure you're importing Firebase auth

const ProtectedRoute = ({ element, redirectTo = "/login" }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div className="text-center">Loading...</div>; // You can add a loader or spinner here
  }

  if (error) {
    console.error("Authentication error:", error);
    return <div className="text-center text-red-500">Error during authentication.</div>;
  }

  // If the user is authenticated, render the element (component)
  return user ? element : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
