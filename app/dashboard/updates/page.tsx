"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Image as ImageIcon, Video, Trash2, Link as LinkIcon } from "lucide-react";

interface Update {
    id: number;
    type: string;
    title: string;
    content: string;
    published_at: string;
}

interface MediaFile {
    file_url: string;
    file_type: "IMAGE" | "VIDEO" | "FIMG" | "FVID";
    is_primary: boolean;
    title?: string;
    file?: File; // for upload
}

export default function UpdatesPage() {
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        type: "Announcement",
        content: "",
        action_link: "",
        action_text: "",
        is_active: true
    });
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchUpdates();
    }, [page]);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/updates?page=${page}&limit=10`);
            if (res.ok) {
                const newUpdates = await res.json();
                if (newUpdates.length < 10) setHasMore(false);
                setUpdates(prev => page === 1 ? newUpdates : [...prev, ...newUpdates]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            const res = await fetch("/api/updates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                // Reset
                setFormData({ title: "", type: "Announcement", content: "", action_link: "", action_text: "", is_active: true });
                setPage(1);
                fetchUpdates(); // Refresh list
            } else {
                alert("Failed to create update");
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-blue-950">Updates Management</h1>
                    <p className="text-slate-500">Manage Announcements, Honours, and Statements.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-900 text-yellow-500 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" /> New Update
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {updates.map(update => (
                    <div key={update.id} className="bg-white p-6 rounded-xl border border-blue-50 hover:border-yellow-200 transition-colors shadow-sm flex justify-between items-start">
                        <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block ${update.type === 'Announcement' ? 'bg-blue-100 text-blue-800' :
                                update.type === 'Honours' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                {update.type}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900">{update.title}</h3>
                            <p className="text-slate-500 mt-1 line-clamp-2">{update.content}</p>
                            <p className="text-xs text-slate-400 mt-2">Published: {new Date(update.published_at).toLocaleString()}</p>
                        </div>
                        {/* Actions: Edit/Delete placeholder */}
                    </div>
                ))}
                {updates.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-400">No updates found.</div>
                )}
            </div>

            {hasMore && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Load More"}
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-blue-950 mb-6">Create New Update</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                    >
                                        <option>Announcement</option>
                                        <option>Honours</option>
                                        <option>Statements</option>
                                        <option>Trust</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                                    <input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                        placeholder="e.g. Royal Decree #55"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                />
                            </div>

                            {/* Links */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Action Text</label>
                                    <input
                                        value={formData.action_text}
                                        onChange={e => setFormData({ ...formData, action_text: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                        placeholder="e.g. Read More"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Action Link</label>
                                    <input
                                        value={formData.action_link}
                                        onChange={e => setFormData({ ...formData, action_link: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-blue-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
