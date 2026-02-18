"use client";

import { useState, useEffect } from "react";

type Meeting = {
  id: number;
  name: string;
  email: string;
  department: string;
  purpose: string;
  date: string;
  time: string;
  status: "Pending" | "Approved" | "Rejected";
};

const EMPTY_FORM = { name: "", email: "", department: "", purpose: "", date: "", time: "" };

const statusStyle: Record<string, string> = {
  Pending:  "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100  text-green-700",
  Rejected: "bg-red-100    text-red-700",
};

export default function MeetingRequestPage() {
  const [meetings, setMeetings]       = useState<Meeting[]>([]);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [search, setSearch]           = useState("");
  const [successMsg, setSuccessMsg]   = useState("");
  const [loading, setLoading]         = useState(true);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Fetch meetings from API
  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        // Update
        const res = await fetch('/api/meetings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        if (res.ok) {
          flash("Meeting request updated successfully!");
          fetchMeetings();
        }
      } else {
        // Create
        const res = await fetch('/api/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          flash("Meeting request submitted successfully!");
          fetchMeetings();
        }
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving meeting:', error);
      flash("Error saving meeting request.");
    }
  };

  const handleEdit = (m: Meeting) => {
    setForm({ name: m.name, email: m.email, department: m.department, purpose: m.purpose, date: m.date, time: m.time });
    setEditingId(m.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/meetings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        flash("Meeting request deleted.");
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
    setDeleteId(null);
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = meetings.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.purpose.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
        .input-field { transition: border-color 0.2s, box-shadow 0.2s; }
        .input-field:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.12); outline: none; }
        .row-hover:hover { background: #f0fdf4; }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <div className="bg-green-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <p className="font-display font-bold text-base leading-tight">Ministry of Agriculture</p>
            <p className="text-green-300 text-xs">Meeting Request Management</p>
          </div>
        </div>
        <a href="/" className="text-sm text-green-300 hover:text-white transition-colors">← Back to Home</a>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* ── SUCCESS TOAST ── */}
        {successMsg && (
          <div className="fade-in mb-5 bg-green-100 border border-green-300 text-green-800 text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2">
            ✅ {successMsg}
          </div>
        )}

        {/* ── PAGE TITLE + NEW BUTTON ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-green-900">Meeting Requests</h1>
            <p className="text-gray-500 text-sm mt-1">{meetings.length} total requests</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              + New Request
            </button>
          )}
        </div>

        {/* ── FORM ── */}
        {showForm && (
          <div className="fade-in bg-white rounded-2xl border border-gray-200 shadow-md p-7 mb-8">
            <h2 className="font-display text-xl font-bold text-green-900 mb-5">
              {editingId ? "✏️ Edit Meeting Request" : "📅 New Meeting Request"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@ministry.gov.ng"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Department *</label>
                  <select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-700">
                    <option value="">Select department</option>
                    {["Infrastructure", "Planning", "Environment", "HR & Admin", "ICT", "Legal"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Purpose of Meeting *</label>
                  <input required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="e.g. Budget Review"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preferred Date *</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preferred Time *</label>
                  <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
                  {editingId ? "Save Changes" : "Submit Request"}
                </button>
                <button type="button" onClick={handleCancel} className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── SEARCH ── */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search by name, purpose or department..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-colors bg-white shadow-sm"
          />
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Purpose</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Date & Time</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    Loading meetings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    No meeting requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="row-hover transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{m.department}</td>
                    <td className="px-5 py-4 text-gray-700">{m.purpose}</td>
                    <td className="px-5 py-4 text-gray-600">
                      <p>{m.date}</p>
                      <p className="text-xs text-gray-400">{m.time}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(m)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(m.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Pending",  count: meetings.filter((m) => m.status === "Pending").length,  color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
            { label: "Approved", count: meetings.filter((m) => m.status === "Approved").length, color: "bg-green-50 border-green-200 text-green-700" },
            { label: "Rejected", count: meetings.filter((m) => m.status === "Rejected").length, color: "bg-red-50 border-red-200 text-red-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-semibold uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full fade-in">
            <div className="text-4xl mb-3 text-center">🗑️</div>
            <h3 className="font-display text-xl font-bold text-gray-900 text-center mb-2">Delete Request?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone. The meeting request will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
