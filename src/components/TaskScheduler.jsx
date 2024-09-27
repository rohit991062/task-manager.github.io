import { useState, useEffect } from "react";
import { db } from "../firebase"; // Assuming Firestore is initialized in this file
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // To get the current user's ID

const TaskScheduler = () => {
  const [taskName, setTaskName] = useState("");
  const [taskPriority, setTaskPriority] = useState("top");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskList, setTaskList] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser.uid;

  // Add a new task to Firestore
  const addNewTask = async () => {
    if (taskName.trim() === "" || taskDeadline === "") {
      alert("Please select an upcoming date for the deadline.");
      return;
    }

    const selectedDate = new Date(taskDeadline);
    const currentDate = new Date();

    if (selectedDate <= currentDate) {
      alert("Please select an upcoming date for the deadline.");
      return;
    }

    try {
      await addDoc(collection(db, "userTasks"), {
        ownerId: userId,
        taskName,
        taskPriority,
        taskDeadline,
        completed: false,
      });

      // Reset input fields
      setTaskName("");
      setTaskPriority("top");
      setTaskDeadline("");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Mark a task as completed
  const completeTask = async (taskId) => {
    try {
      const taskDocRef = doc(db, "userTasks", taskId); // Reference to the specific task document
      await updateDoc(taskDocRef, {
        completed: true,
      });
      console.log("Task marked as completed");
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  // Real-time listener for tasks from Firestore
  useEffect(() => {
    const q = query(collection(db, "userTasks"), where("ownerId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id, // Store the task ID for later use
        ...doc.data(),
      }));
      setTaskList(tasks);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="min-h-screen p-5 bg-gray-100">
      <header className="mb-5 text-center">
        <h1 className="text-3xl font-bold">Task Scheduler</h1>
      </header>
      <main>
        <div className="mb-5 task-form">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter task..."
            className="p-2 mr-2 border rounded"
          />
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            className="p-2 mr-2 border rounded"
          >
            <option value="top">Top Priority</option>
            <option value="middle">Middle Priority</option>
            <option value="low">Less Priority</option>
          </select>
          <input
            type="date"
            value={taskDeadline}
            onChange={(e) => setTaskDeadline(e.target.value)}
            className="p-2 mr-2 border rounded"
          />
          <button
            onClick={addNewTask}
            className="p-2 text-white bg-blue-500 rounded"
          >
            Add Task
          </button>
        </div>

        <div className="task-list">
          {taskList.map((task) => (
            <div
              key={task.id}
              className={`mb-3 p-3 border rounded bg-white ${
                task.completed ? "bg-gray-200" : ""
              }`}
            >
              <p>{task.taskName}</p>
              <p>Priority: {task.taskPriority}</p>
              <p>Deadline: {task.taskDeadline}</p>
              <button
                onClick={() => completeTask(task.id)}
                className={`mt-2 p-2 text-white rounded ${
                  task.completed ? "bg-gray-400" : "bg-green-500"
                }`}
                disabled={task.completed}
              >
                {task.completed ? "Completed" : "Mark Done"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TaskScheduler;
