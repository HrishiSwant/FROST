import { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://frost-7sn1.onrender.com";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/stats`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total" value={data.total} />
        <Card title="Phone" value={data.phone} />
        <Card title="News" value={data.news} />
        <Card title="Deepfake" value={data.deepfake} />
      </div>

      <h2 className="text-xl mb-4">Recent Activity</h2>

      <div className="space-y-2">
        {data.recent.map((item) => (
          <div key={item._id} className="p-3 border rounded">
            <p>Type: {item.type}</p>
            <p>IP: {item.ip}</p>
            <p>Verdict: {item.result?.verdict || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 border rounded">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
