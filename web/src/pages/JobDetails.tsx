import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

export default function JobDetails() {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [job, setJob] = useState<any | null>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setJob(r.data))
      .catch(() => setJob(null));
  }, [id]);

  if (!job) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">{job.name}</h1>
        <form method="post" action="#" onSubmit={async (e) => {
          e.preventDefault();
          await axios.post(`${API_URL}/jobs/${job.id}/run`, {}, { headers: { Authorization: `Bearer ${token}` } });
          const r = await axios.get(`${API_URL}/jobs/${job.id}`, { headers: { Authorization: `Bearer ${token}` } });
          setJob(r.data);
        }}>
          <button className="bg-blue-600 text-white px-3 py-1 rounded">Run Now</button>
        </form>
      </div>

      <div className="mb-4">URL: <a className="text-blue-600" href={job.url} target="_blank">{job.url}</a></div>

      <h2 className="font-semibold mb-2">Runs</h2>
      <div className="space-y-3">
        {job.runs.map((r: any) => (
          <div key={r.id} className="bg-white rounded shadow p-3">
            <div className="text-sm">Status: <span className="font-mono">{r.status}</span></div>
            {r.screenshot && (
              <a href={`${API_URL}${r.screenshot}`} target="_blank">
                <img src={`${API_URL}${r.screenshot}`} className="mt-2 max-h-64 border" />
              </a>
            )}
            {r.logs && (
              <pre className="bg-gray-50 p-2 mt-2 text-xs overflow-auto whitespace-pre-wrap">{r.logs}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


