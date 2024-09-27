import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true); // Loading state for user info
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email || "User");
    } else {
      // If no user is found, navigate to login
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        navigate("/login"); // Redirect to login page after logout
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
      <div className="flex gap-4">
      <Link
          to="/task-Scheduler"
          className="px-4 py-2 text-white bg-yellow-600 rounded"
        >
          Personel Task Management
        </Link>
        <Link
          to="/setup-project"
          className="px-4 py-2 text-white bg-green-600 rounded"
        >
          Setup a New Project
        </Link>
        <Link
          to="/join-project"
          className="px-4 py-2 text-white bg-blue-600 rounded"
        >
          Join a Project
        </Link>
        <Link
          to="/my-projects"
          className="px-4 py-2 text-white bg-purple-600 rounded"
        >
          My Projects
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 mt-4 text-white bg-red-600 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
