import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const TaskBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [newTask, setNewTask] = useState({ description: "", assignedTo: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState({
    taskName: "",
    progress: "",
    review: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "projects", projectId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const projectData = docSnapshot.data();
        setProject(projectData);
        const user = auth.currentUser;

        if (user) {
          if (projectData.admin === user.uid) {
            setIsAdmin(true); // User is admin
          } else if (projectData.members && projectData.members[user.uid]) {
            setIsAdmin(false); // User is member
          } else {
            setError("You are not a member of this project.");
          }
        }
      } else {
        setError("Project not found.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const addTask = async () => {
    if (!newTask.description || !newTask.assignedTo) {
      setError("Please fill in all fields.");
      return;
    }

    const updatedTasks = [
      ...(project?.tasks || []),
      { ...newTask, status: "Task Ready", progress: 0 },
    ];

    await updateDoc(doc(db, "projects", projectId), {
      tasks: updatedTasks,
    });

    setNewTask({ description: "", assignedTo: "" });
    setError(null);
  };

  const updateTaskProgress = async () => {
    const task = project.tasks.find((t) => t.description === progressUpdates.taskName);

    if (!task) {
      setError("Task does not exist.");
      return;
    }

    const newProgress = parseInt(progressUpdates.progress);
    const updatedTasks = project.tasks.map((t) => {
      if (t.description === progressUpdates.taskName) {
        return {
          ...t,
          progress: newProgress,
          status: newProgress === 100 ? "Done" : newProgress > 0 ? "In Progress" : t.status,
        };
      }
      return t;
    });

    await updateDoc(doc(db, "projects", projectId), {
      tasks: updatedTasks,
    });

    // Only allow admin to post reviews
    if (isAdmin && progressUpdates.review) {
      const updatedReviews = [
        ...(project.reviews || []),
        { taskName: progressUpdates.taskName, review: progressUpdates.review },
      ];
      await updateDoc(doc(db, "projects", projectId), {
        reviews: updatedReviews,
      });
    }

    setProgressUpdates({ taskName: "", progress: "", review: "" });
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="text-center">Project not available.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 h-full p-6 overflow-y-auto bg-white shadow-lg">
        <h2 className="mb-6 text-2xl font-semibold">{project?.name}</h2>

        {/* Admin Info Section */}
        {isAdmin && (
          <div className="p-4 mb-8 bg-gray-100 rounded-lg shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-blue-600">Project Details</h3>
            <p className="mb-1 text-sm text-gray-700">
              <strong>Project ID:</strong> <span className="text-gray-900">{projectId}</span>
            </p>
            <p className="text-sm text-gray-700">
              <strong>Access Code:</strong> <span className="text-gray-900">{project?.accessCode}</span>
            </p>
          </div>
        )}

        {/* Add Task Section */}
        {isAdmin && (
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold">Add Task</h3>
            <input
              type="text"
              placeholder="Task Description"
              className="w-full p-2 mb-2 border"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Assign to"
              className="w-full p-2 mb-4 border"
              value={newTask.assignedTo}
              onChange={(e) =>
                setNewTask({ ...newTask, assignedTo: e.target.value })
              }
            />
            <button
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg"
              onClick={addTask}
            >
              Add Task
            </button>
          </div>
        )}

        {/* Update Task Progress Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold">Update Task Progress</h3>
          <input
            type="text"
            placeholder="Task Name"
            className="w-full p-2 mb-2 border"
            value={progressUpdates.taskName}
            onChange={(e) =>
              setProgressUpdates({ ...progressUpdates, taskName: e.target.value })
            }
          />
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Progress %"
            className="w-full p-2 mb-2 border"
            value={progressUpdates.progress}
            onChange={(e) =>
              setProgressUpdates({ ...progressUpdates, progress: e.target.value })
            }
          />
          {isAdmin && (
            <input
              type="text"
              placeholder="Add Review"
              className="w-full p-2 mb-4 border"
              value={progressUpdates.review}
              onChange={(e) =>
                setProgressUpdates({ ...progressUpdates, review: e.target.value })
              }
            />
          )}
          <button
            className="w-full px-4 py-2 text-white bg-green-500 rounded-lg"
            onClick={updateTaskProgress}
          >
            Update Progress
          </button>
        </div>

        {/* Members Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold">Members</h3>
          <ul>
            {Object.keys(project?.members || {}).length > 0 ? (
              Object.keys(project.members).map((memberId) => (
                <li key={memberId} className="mb-2">
                  {memberId}
                </li>
              ))
            ) : (
              <p>No members yet.</p>
            )}
          </ul>
        </div>

        {/* Project Progress Section */}
        <div>
          <h3 className="mb-4 text-xl font-semibold">Overall Progress</h3>
          <div className="w-full bg-gray-200 rounded-full">
            <div
              className="p-1 text-xs font-medium leading-none text-center text-blue-100 bg-blue-500 rounded-full"
              style={{ width: `${project?.progress}%` }}
            >
              {project?.progress}% Complete
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <button
          className="w-full px-4 py-2 mt-4 text-white bg-red-500 rounded-lg"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </aside>

      {/* Taskboard */}
      <main className="flex-1 h-full p-6 overflow-y-auto">
        <div className="grid grid-cols-4 gap-4">
          {["Task Ready", "In Progress", "Review", "Done"].map((column, index) => (
            <div
              key={index}
              className="h-full p-4 overflow-y-auto bg-white rounded-lg shadow"
            >
              <h3 className="mb-4 text-xl font-semibold">{column}</h3>
              <ul>
                {column === "Review" ? (
                  project?.reviews?.map((review, index) => (
                    <li
                      key={index}
                      className="p-2 mb-2 bg-gray-100 border rounded-lg"
                    >
                      <strong>{review.taskName}</strong>: {review.review}
                    </li>
                  ))
                ) : (
                  project?.tasks
                    ?.filter((task) => task.status === column)
                    .map((task, index) => (
                      <li key={index} className="p-2 mb-2 bg-gray-100 border rounded-lg">
                        <strong>{task.description}</strong> (Assigned to: {task.assignedTo})
                      </li>
                    ))
                )}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TaskBoard;
