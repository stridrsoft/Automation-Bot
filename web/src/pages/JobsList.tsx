import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

export default function JobsList() {
  const [jobs, setJobs] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get(`${API_URL}/jobs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setJobs(r.data))
      .catch(() => setJobs([]));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Jobs</h1>
        <Link to="/jobs/create" className="bg-blue-600 text-white px-3 py-1 rounded">New Job</Link>
      </div>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">URL</th>
              <th className="p-2">Last Run</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t">
                <td className="p-2"><Link className="text-blue-600" to={`/jobs/${j.id}`}>{j.name}</Link></td>
                <td className="p-2">{j.url}</td>
                <td className="p-2">{j.runs?.[0]?.status || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


