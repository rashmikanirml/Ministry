"use client";

import { useState } from "react";

type TonerRequest = {
  id: number;
  division: string;
  printerName: string;
  model: string;
  requestedBy: string;
  pageCounter: string;
  date: string;
  notes: string;
  status: "Pending" | "Approved" | "Issued" | "Rejected";
};

const INITIAL_DATA: TonerRequest[] = [
  {
    id: 1,
    division: "Finance & Accounts",
    printerName: "HP LaserJet Pro - Finance 01",
    model: "HP CF217A",
    requestedBy: "Amina Yusuf",
    pageCounter: "14,320",
    date: "2026-02-10",
    notes: "Toner almost empty, urgent replacement needed.",
    status: "Approved",
  },
  {
    id: 2,
    division: "Human Resources",
    printerName: "Canon imageRUNNER - HR Main",
    model: "Canon 045H",
    requestedBy: "Bola Adewale",
    pageCounter: "8,750",
    date: "2026-02-14",
    notes: "Printing quality degrading significantly.",
    status: "Pending",
  },
  {
    id: 3,
    division: "ICT Department",
    printerName: "Brother MFC - ICT Office",
    model: "Brother TN-2420",
    requestedBy: "Lawal Sani",
    pageCounter: "22,100",
    date: "2026-02-15",
    notes: "Monthly scheduled toner replacement.",
    status: "Issued",
  },
];

const EMPTY_FORM = {
  division: "",
  printerName: "",
  model: "",
  requestedBy: "",
  pageCounter: "",
  date: "",
  notes: "",
};

const statusStyle: Record<string, string> = {
  Pending:  "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-700",
  Issued:   "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const statusIcon: Record<string, string> = {
  Pending:  "⏳",
  Approved: "✅",
  Issued:   "📦",
  Rejected: "❌",
};

const DIVISIONS = [
  "Finance & Accounts",
  "Human Resources",
  "ICT Department",
  "Legal & Compliance",
  "Infrastructure",
  "Planning & Budget",
  "Environment",
  "Office of the Director General",
  "Procurement",
  "Administration",
];

export default function TonerRequestPage() {
  const [requests, setRequests]     = useState<TonerRequest[]>(INITIAL_DATA);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [viewItem, setViewItem]     = useState<TonerRequest | null>(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilter]   = useState("All");
  const [successMsg, setSuccessMsg] = useState("");

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setRequests(requests.map((r) => r.id === editingId ? { ...r, ...form } : r));
      flash("Toner request updated successfully!");
    } else {
      const newRequest: TonerRequest = { ...form, id: Date.now(), status: "Pending" };
      setRequests([newRequest, ...requests]);
      flash("Toner request submitted successfully!");
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (r: TonerRequest) => {
    setForm({
      division: r.division,
      printerName: r.printerName,
      model: r.model,
      requestedBy: r.requestedBy,
      pageCounter: r.pageCounter,
      date: r.date,
      notes: r.notes,
    });
    setEditingId(r.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    setRequests(requests.filter((r) => r.id !== id));
    setDeleteId(null);
    flash("Toner request deleted.");
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.division.toLowerCase().includes(search.toLowerCase()) ||
      r.printerName.toLowerCase().includes(search.toLowerCase()) ||
      r.model.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      <style>{`
        .font-display { font-family: 'Playfair Display', serif; }
        .input-field { transition: border-color 0.2s, box-shadow 0.2s; }
        .input-field:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.12); outline: none; }
        .row-hover:hover { background: #f0fdf4; }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── HEADER ── */}
      <div className="bg-green-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🖨️</span>
          <div>
            <p className="font-display font-bold text-base leading-tight">Ministry of Agriculture</p>
            <p className="text-green-300 text-xs">Toner Request Management</p>
          </div>
        </div>
        <a href="/" className="text-sm text-green-300 hover:text-white transition-colors">← Back to Home</a>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── TOAST ── */}
        {successMsg && (
          <div className="fade-in mb-5 bg-green-100 border border-green-300 text-green-800 text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2">
            ✅ {successMsg}
          </div>
        )}

        {/* ── PAGE TITLE + BUTTON ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-green-900">Toner Requests</h1>
            <p className="text-gray-500 text-sm mt-1">{requests.length} total requests</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              + New Toner Request
            </button>
          )}
        </div>

        {/* ── FORM ── */}
        {showForm && (
          <div className="fade-in bg-white rounded-2xl border border-gray-200 shadow-md p-7 mb-8">
            <h2 className="font-display text-xl font-bold text-green-900 mb-1">
              {editingId ? "✏️ Edit Toner Request" : "🖨️ New Toner Request"}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Fill in the printer details and submit for ICT approval.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">

                {/* Division */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Division / Unit *
                  </label>
                  <select
                    required
                    value={form.division}
                    onChange={(e) => setForm({ ...form, division: e.target.value })}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-700"
                  >
                    <option value="">Select division</option>
                    {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* Requested By */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Requested By (User Name) *
                  </label>
                  <input
                    required
                    value={form.requestedBy}
                    onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50"
                  />
                </div>

                {/* Printer Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Printer Name *
                  </label>
                  <input
                    required
                    value={form.printerName}
                    onChange={(e) => setForm({ ...form, printerName: e.target.value })}
                    placeholder="e.g. HP LaserJet Pro - Finance 01"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50"
                  />
                </div>

                {/* Toner Model */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Toner Model / Part Number *
                  </label>
                  <input
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="e.g. HP CF217A"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50"
                  />
                </div>

                {/* Page Counter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Current Page Counter *
                  </label>
                  <input
                    required
                    value={form.pageCounter}
                    onChange={(e) => setForm({ ...form, pageCounter: e.target.value })}
                    placeholder="e.g. 14,320"
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Request Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Additional Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Toner almost empty, low print quality, scheduled replacement..."
                    className="input-field w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
                >
                  {editingId ? "Save Changes" : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── SEARCH + FILTER ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search by division, printer, model or user..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-colors bg-white shadow-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {["All", "Pending", "Approved", "Issued", "Rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
                  filterStatus === f
                    ? "bg-green-700 text-white border-green-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Division</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Printer Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Toner Model</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Requested By</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Page Counter</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-gray-400 text-sm">
                    🖨️ No toner requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="row-hover transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{r.division}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{r.printerName}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{r.model}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{r.requestedBy}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-800">{r.pageCounter}</span>
                      <p className="text-xs text-gray-400">pages</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle[r.status]}`}>
                        {statusIcon[r.status]} {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewItem(r)}
                          className="text-xs font-semibold text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors"
                        >
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

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Pending",  color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
            { label: "Approved", color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Issued",   color: "bg-green-50 border-green-200 text-green-700" },
            { label: "Rejected", color: "bg-red-50 border-red-200 text-red-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{requests.filter((r) => r.status === s.label).length}</p>
              <p className="text-xs font-semibold uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── VIEW DETAIL MODAL ── */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-md w-full fade-in">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl font-bold text-green-900">🖨️ Toner Request Details</h3>
              <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Division",       viewItem.division],
                ["Printer Name",   viewItem.printerName],
                ["Toner Model",    viewItem.model],
                ["Requested By",   viewItem.requestedBy],
                ["Page Counter",   viewItem.pageCounter + " pages"],
                ["Request Date",   viewItem.date],
                ["Status",         `${statusIcon[viewItem.status]} ${viewItem.status}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="font-semibold text-gray-800 text-right">{val}</span>
                </div>
              ))}
              {viewItem.notes && (
                <div className="pt-1">
                  <p className="text-gray-400 font-medium mb-1">Notes</p>
                  <p className="text-gray-700 leading-relaxed">{viewItem.notes}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setViewItem(null)}
              className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full fade-in">
            <div className="text-4xl mb-3 text-center">🗑️</div>
            <h3 className="font-display text-xl font-bold text-gray-900 text-center mb-2">Delete Request?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone. The toner request will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
