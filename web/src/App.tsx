import { Link, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import JobsList from './pages/JobsList';
import JobCreate from './pages/JobCreate';
import JobDetails from './pages/JobDetails';

function useAuth() {
  const token = localStorage.getItem('token');
  return { token, setToken: (t: string) => localStorage.setItem('token', t), clear: () => localStorage.removeItem('token') };
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const { token, clear } = useAuth();
  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <div className="font-semibold"><Link to="/">Automation Dashboard</Link></div>
        <div className="space-x-3">
          <Link to="/jobs" className="text-blue-600">Jobs</Link>
          <Link to="/jobs/create" className="text-blue-600">Create</Link>
          {token ? (
            <button className="text-red-600" onClick={() => { clear(); navigate('/login'); }}>Logout</button>
          ) : (
            <Link to="/login" className="text-blue-600">Login</Link>
          )}
        </div>
      </nav>
      <main className="p-4 max-w-5xl mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/jobs" element={<PrivateRoute><JobsList /></PrivateRoute>} />
          <Route path="/jobs/create" element={<PrivateRoute><JobCreate /></PrivateRoute>} />
          <Route path="/jobs/:id" element={<PrivateRoute><JobDetails /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>
    </div>
  );
}


