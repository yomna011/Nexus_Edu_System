'use client';

import { useEffect, useState } from 'react';

type Application = {
  id: string;
  studentName: string;
  submissionDate: string;
  status: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/applications?status=SUBMITTED');
        const data = await res.json();
        setApplications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = applications.filter((app) => {
    const date = new Date(app.submissionDate);

    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate)) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    return sortOrder === 'asc'
      ? new Date(a.submissionDate).getTime() -
          new Date(b.submissionDate).getTime()
      : new Date(b.submissionDate).getTime() -
          new Date(a.submissionDate).getTime();
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Submitted Applications
      </h1>

      {/* FILTER UI */}
      <div className="flex gap-3 mb-4">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={() => {
            setFromDate('');
            setToDate('');
          }}
          className="px-3 py-2 border rounded"
        >
          Reset
        </button>
      </div>

      {/* SORT BUTTON */}
      <button
        onClick={() =>
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        }
        className="mb-4 px-4 py-2 border rounded"
      >
        Sort by Date ({sortOrder})
      </button>

      {/* TABLE */}
      <div className="border rounded">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Student Name</th>
              <th className="p-3 text-left">Application ID</th>
              <th className="p-3 text-left">Submission Date</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  No applications found
                </td>
              </tr>
            ) : (
              sorted.map((app) => (
                <tr key={app.id} className="border-t">

                  <td className="p-3">{app.studentName}</td>

                  <td className="p-3">{app.id}</td>

                  <td className="p-3">
                    {app.submissionDate
                      ? new Date(app.submissionDate).toLocaleDateString()
                      : '-'}
                  </td>

                  {/* US-1.5B STATUS DROPDOWN */}
                  <td className="p-3">
                    <select
                      value={app.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;

                        await fetch('/api/applications', {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            id: app.id,
                            status: newStatus,
                          }),
                        });

                        // update UI instantly
                        setApplications((prev) =>
                          prev.map((a) =>
                            a.id === app.id
                              ? { ...a, status: newStatus }
                              : a
                          )
                        );
                      }}
                      className="border p-1 rounded"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="WAITLISTED">Waitlisted</option>
                    </select>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}