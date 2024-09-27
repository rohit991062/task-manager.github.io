import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";

function MyProjects() {
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetch projects created by the user
          const createdProjectsQuery = query(
            collection(db, "projects"),
            where("admin", "==", user.uid)
          );
          const createdSnapshot = await getDocs(createdProjectsQuery);
          setCreatedProjects(
            createdSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );

          // Fetch projects where the user is a member
          const joinedProjectsQuery = query(
            collection(db, "projects"),
            where(`members.${user.uid}`, "==", true)
          );
          const joinedSnapshot = await getDocs(joinedProjectsQuery);
          setJoinedProjects(
            joinedSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        } catch (error) {
          setError("Failed to fetch projects. Please try again later.");
        }
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "projects", projectId));

        // Remove deleted project from both created and joined projects arrays
        setCreatedProjects((prevProjects) =>
          prevProjects.filter((project) => project.id !== projectId)
        );
        setJoinedProjects((prevProjects) =>
          prevProjects.filter((project) => project.id !== projectId)
        );
      } catch (error) {
        setError("Failed to delete project. Please try again later.");
      }
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h2 className="mb-6 text-2xl font-bold text-center">My Projects</h2>
      {error && <p className="text-center text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Created Projects */}
        <div>
          <h3 className="mb-4 text-xl font-semibold">Created Projects</h3>
          <ul className="p-4 border rounded-lg">
            {createdProjects.length > 0 ? (
              createdProjects.map((project) => (
                <li key={project.id} className="flex items-center justify-between mb-2">
                  <Link to={`/taskboard/${project.id}`} className="text-blue-600 hover:underline">
                    {project.name}
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="ml-4 text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))
            ) : (
              <p>
                No projects created yet.{" "}
                <Link to="/setup-project" className="text-blue-600 underline">
                  Create a new project
                </Link>
              </p>
            )}
          </ul>
        </div>

        {/* Joined Projects */}
        <div>
          <h3 className="mb-4 text-xl font-semibold">Joined Projects</h3>
          <ul className="p-4 border rounded-lg">
            {joinedProjects.length > 0 ? (
              joinedProjects.map((project) => (
                <li key={project.id} className="mb-2">
                  <Link to={`/taskboard/${project.id}`} className="text-blue-600 hover:underline">
                    {project.name}
                  </Link>
                </li>
              ))
            ) : (
              <p>No projects joined yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MyProjects;
