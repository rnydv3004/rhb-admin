"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Image as ImageIcon, Trash2, Edit, Copy, MoreVertical, X, UploadCloud } from "lucide-react";
import Image from "next/image";

interface Member {
    id: number;
    name: string;
    role_title: string;
    category: string;
    display_order: number;
    is_active: number;
    bio: string;
    image_url: string;
    created_at: string;
    updated_at: string;
}

export default function AdministrationPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // Simple pagination if needed, or just list all
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role_title: "",
        category: "OFFICER",
        display_order: 1,
        is_active: 1,
        bio: "",
        image_url: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/administration?limit=100`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member: Member) => {
        setFormData({
            name: member.name || "",
            role_title: member.role_title,
            category: member.category,
            display_order: member.display_order,
            is_active: member.is_active,
            bio: member.bio || "",
            image_url: member.image_url || ""
        });
        setEditingId(member.id);
        setShowModal(true);
    };

    const handleCopy = (member: Member) => {
        setFormData({
            name: member.name || "",
            role_title: member.role_title + " (Copy)",
            category: member.category,
            display_order: member.display_order,
            is_active: 0, // Default to inactive for copy
            bio: member.bio || "",
            image_url: member.image_url || ""
        });
        setEditingId(null); // Treat as new
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this member?")) return;

        try {
            const res = await fetch(`/api/administration/${id}`, { method: "DELETE" });
            if (res.ok) {
                setMembers(prev => prev.filter(m => m.id !== id));
            } else {
                alert("Failed to delete member");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting member");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setUploadingImage(true);

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, image_url: data.url }));
            } else {
                alert("Image upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading image");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingId ? `/api/administration/${editingId}` : "/api/administration";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setShowModal(false);
                setEditingId(null);
                setFormData({
                    name: "",
                    role_title: "",
                    category: "OFFICER",
                    display_order: 1,
                    is_active: 1,
                    bio: "",
                    image_url: ""
                });
                fetchMembers();
            } else {
                alert(data.message || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to check mandatory fields for validation UI
    const isChancellor = formData.role_title.toLowerCase().includes("chancellor") ||
        formData.role_title.toLowerCase().includes("vice-chancellor");

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen font-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-blue-950">Royal Administration</h1>
                    <p className="text-slate-500">Manage Officers, Advisors, and Delegates of the Royal House.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            name: "",
                            role_title: "",
                            category: "OFFICER",
                            display_order: 1,
                            is_active: 1,
                            bio: "",
                            image_url: ""
                        });
                        setShowModal(true);
                    }}
                    className="bg-blue-900 text-yellow-500 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" /> Add Member
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Image</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name / Title</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members.map((member, index) => (
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 text-slate-400 font-mono text-xs">{member.id}</td>
                                    <td className="p-4 text-slate-600 font-semibold">{member.display_order}</td>
                                    <td className="p-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                                            {member.image_url ? (
                                                <Image
                                                    src={member.image_url}
                                                    alt={member.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <ImageIcon className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{member.name || "—"}</div>
                                        <div className="text-xs text-blue-600 font-medium">{member.role_title}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${member.category === 'OFFICER' ? 'bg-indigo-100 text-indigo-700' :
                                                member.category === 'ADVISOR' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {member.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`w-2 h-2 rounded-full inline-block mr-2 ${member.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                        <span className="text-sm text-slate-600">{member.is_active ? 'Active' : 'Hidden'}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopy(member)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Copy"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                        No administration members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-950">
                                {editingId ? "Edit Member" : "Add New Member"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Image */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">Profile Image</label>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 transition-colors ${isChancellor && !formData.image_url ? "border-red-300 bg-red-50" : "border-slate-200 hover:border-blue-300"
                                            }`}
                                    >
                                        {formData.image_url ? (
                                            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3 border border-slate-200">
                                                <Image
                                                    src={formData.image_url}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center mb-3 text-slate-400">
                                                <ImageIcon className="w-12 h-12" />
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                        >
                                            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                            {formData.image_url ? "Change Image" : "Upload Image"}
                                        </button>
                                        {isChancellor && !formData.image_url && (
                                            <p className="text-xs text-red-500 mt-2 font-medium">Required for this role.</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.display_order}
                                            onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!!formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                        <span className="text-sm font-medium text-slate-700">Active</span>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Role Title <span className="text-red-500">*</span></label>
                                        <input
                                            value={formData.role_title}
                                            onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. Chancellor"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Name / Surname</label>
                                        <input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Category <span className="text-red-500">*</span></label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="OFFICER">OFFICER</option>
                                            <option value="ADVISOR">ADVISOR</option>
                                            <option value="DELEGATE">DELEGATE</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Biography</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            rows={4}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Short bio..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || (isChancellor && !formData.image_url)}
                                    className="bg-blue-900 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-900/10"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Member" : "Add Member")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
