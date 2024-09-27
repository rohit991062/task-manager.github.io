import { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating access code

function ProjectSetup() {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation for empty fields
    if (projectName.trim() === "") {
      setError("Project name cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to create a project.");
        setLoading(false);
        return;
      }

      const accessCode = uuidv4(); // Generate a unique access code

      // Create the project document
      const projectRef = await addDoc(collection(db, "projects"), {
        name: projectName,
        admin: user.uid,
        accessCode: accessCode, // Save the access code here
        members: {
          [user.uid]: true, // Add the admin as a member
        },
        tasks: [],
        progress: 0,
        requests: [], // Initialize with empty requests array
      });

      // Navigate to the TaskBoard and pass the project ID
      navigate(`/taskboard/${projectRef.id}`, {
        state: { projectName, adminId: user.uid },
      });
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false); // Ensure loading is stopped
    }
  };

  return (
    <form
      onSubmit={handleCreateProject}
      className="max-w-md p-6 mx-auto mt-10 border rounded shadow-md"
    >
      <h2 className="mb-6 text-3xl font-bold text-center">Setup a New Project</h2>

      {error && <p className="mb-4 text-red-500">{error}</p>} {/* Error message */}

      <input
        type="text"
        className="w-full p-2 mb-4 border rounded"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        required
      />

      <button
        type="submit"
        className={`w-full px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 ${loading && "opacity-50 cursor-not-allowed"}`}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}

export default ProjectSetup;
