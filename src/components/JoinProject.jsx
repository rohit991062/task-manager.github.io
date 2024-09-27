import { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const JoinProject = () => {
  const [projectId, setProjectId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    setError(null);
    setLoading(true);

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const projectData = projectSnap.data();

        // Check if the access code matches
        if (projectData.accessCode === accessCode) {
          const userId = auth.currentUser.uid;

          // Check if the 'members' map exists, and if the current user is already a member
          const members = projectData.members || {};

          if (!members[userId]) {
            // Add the user to the project's members map
            await updateDoc(projectRef, {
              [`members.${userId}`]: true,
            });

            console.log("Successfully joined the project.");
          } else {
            console.log("You are already a member of this project.");
          }

          // Navigate to the taskboard page (assuming taskboard route exists)
          navigate(`/projects/${projectId}/taskboard`);
        } else {
          setError('Invalid access code. Please try again.');
        }
      } else {
        setError('Project does not exist.');
      }
    } catch (err) {
      console.error("Error joining project:", err);
      setError('An error occurred while trying to join the project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-semibold text-center">Join a Project</h2>
      <div className="mb-4">
        <input 
          type="text" 
          value={projectId} 
          onChange={(e) => setProjectId(e.target.value)} 
          placeholder="Enter Project ID" 
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <input 
          type="text" 
          value={accessCode} 
          onChange={(e) => setAccessCode(e.target.value)} 
          placeholder="Enter Access Code" 
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button 
        onClick={handleJoin} 
        disabled={loading} 
        className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {loading ? 'Joining...' : 'Join Project'}
      </button>
      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
};

export default JoinProject;
