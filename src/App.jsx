import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Signup from './routes/Signup';
import Login from './routes/Signin';
import Dashboard from './components/Dashboard';
import ProjectSetup from './components/ProjectSetup';
import JoinProject from './components/JoinProject';
import TaskBoard from './components/TaskBoard';
import MyProjects from './components/MyProjects';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute
import TaskScheduler from './components/TaskScheduler';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Authenticated Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/setup-project" element={<ProtectedRoute element={<ProjectSetup />} />} />
        <Route path="/join-project" element={<ProtectedRoute element={<JoinProject />} />} />

        {/* TaskBoard Route with projectId */}
        <Route path="/taskboard/:projectId" element={<ProtectedRoute element={<TaskBoard />} />} />
        <Route path="/projects/:projectId/taskboard" element={<ProtectedRoute element={<TaskBoard />} />} />

        <Route path="/task-scheduler" element={<ProtectedRoute element={<TaskScheduler />} />} />

        {/* My Projects Route */}
        <Route path="/my-projects" element={<ProtectedRoute element={<MyProjects />} />} />
      </Routes>
    </Router>
  );
}

export default App;
