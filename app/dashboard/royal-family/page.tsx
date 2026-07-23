"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Image as ImageIcon, Trash2, Edit, Copy, X, Save, Users } from "lucide-react";
import Image from "next/image";

interface RoyalMember {
    id: number;
    member_type: string;
    full_name: string;
    title_main: string;
    title_highlight: string;
    section_subtitle: string;
    description: string;
    image_url: string;
    image_caption: string;
    role_bottom: string;
    is_visible: number;
    display_order: number;
    created_at: string;
    updated_at: string;
}

const processDriveUrl = (url: string | null | undefined): string => {
    if (!url) return "";
    const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=)|docs\.google\.com\/file\/d\/)([-_\w]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
    }
    return url;
};

export default function RoyalFamilyPage() {
    const [members, setMembers] = useState<RoyalMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        member_type: "member",
        full_name: "",
        title_main: "",
        title_highlight: "",
        section_subtitle: "",
        description: "",
        image_url: "",
        image_caption: "",
        role_bottom: "",
        is_visible: 1,
        display_order: 0
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/royal-family");
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member: RoyalMember) => {
        setFormData({
            member_type: member.member_type || "member",
            full_name: member.full_name || "",
            title_main: member.title_main || "",
            title_highlight: member.title_highlight || "",
            section_subtitle: member.section_subtitle || "",
            description: member.description || "",
            image_url: member.image_url || "",
            image_caption: member.image_caption || "",
            role_bottom: member.role_bottom || "",
            is_visible: member.is_visible,
            display_order: member.display_order
        });
        setEditingId(member.id);
        setShowModal(true);
    };

    const handleCopy = (member: RoyalMember) => {
        setFormData({
            ...member,
            full_name: member.full_name + " (Copy)",
            is_visible: 0
        });
        setEditingId(null);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this royal family record?")) return;

        try {
            const res = await fetch(`/api/royal-family/${id}`, { method: "DELETE" });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingId ? `/api/royal-family/${editingId}` : "/api/royal-family";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingId(null);
                fetchMembers();
            } else {
                const data = await res.json();
                alert(data.message || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            alert("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen font-sans bg-slate-50/30">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-blue-950">Royal Family Members</h1>
                    <p className="text-slate-500 mt-1 text-lg">Manage the official records of the Royal House of Bharuch.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            member_type: "member",
                            full_name: "",
                            title_main: "",
                            title_highlight: "",
                            section_subtitle: "",
                            description: "",
                            image_url: "",
                            image_caption: "",
                            role_bottom: "",
                            is_visible: 1,
                            display_order: 0
                        });
                        setShowModal(true);
                    }}
                    className="bg-blue-900 text-yellow-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Add New Member
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
                </div>
            ) : (
                <div className="grid gap-6">
                    {members.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">No members found</h3>
                            <p className="text-slate-400">Start by adding the Head of the House.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Display</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type / Name</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Main Title</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {members.map((member) => (
                                        <tr key={member.id} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4">
                                                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200 shadow-inner">
                                                    {member.image_url ? (
                                                        <Image src={processDriveUrl(member.image_url)} alt={member.full_name} fill className="object-cover" unoptimized={true} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-6 h-6" /></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter w-fit px-1.5 py-0.5 rounded-md mb-1 ${
                                                        member.member_type === 'head' ? 'bg-amber-100 text-amber-700' : 
                                                        member.member_type === 'heir' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {member.member_type}
                                                    </span>
                                                    <span className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">{member.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600 line-clamp-1 italic">{member.title_main || "—"}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-mono text-slate-500">#{member.display_order}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${member.is_visible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                                    <span className={`text-xs font-semibold ${member.is_visible ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                        {member.is_visible ? 'Public' : 'Private'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleCopy(member)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-100"><Copy className="w-4 h-4" /></button>
                                                    <button onClick={() => handleEdit(member)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-100"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-blue-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 max-h-[95vh] overflow-y-auto border border-blue-100">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-blue-950">
                                    {editingId ? "Modify Royal Record" : "New Royal Record"}
                                </h2>
                                <p className="text-slate-500 text-xs mt-0.5">Ensure all titles and honors are correctly stated.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Member Identity Section */}
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Member Type</label>
                                        <select
                                            value={formData.member_type}
                                            onChange={e => setFormData({ ...formData, member_type: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-900 outline-none transition-all font-bold text-blue-950 text-sm"
                                        >
                                            <option value="head">The Head</option>
                                            <option value="heir">The Heir</option>
                                            <option value="member">Family Member</option>
                                            <option value="extended">Extended Family</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.display_order}
                                            onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-900 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name & Honors</label>
                                    <input
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-900 outline-none transition-all text-base font-bold shadow-sm"
                                        placeholder="e.g. H.R.H. Nawab Mirza..."
                                    />
                                </div>
                            </div>

                            {/* Titles Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Main Title</label>
                                    <input
                                        value={formData.title_main}
                                        onChange={e => setFormData({ ...formData, title_main: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-900 outline-none transition-all text-sm"
                                        placeholder="e.g. Nawab of"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Highlighted Title</label>
                                    <input
                                        value={formData.title_highlight}
                                        onChange={e => setFormData({ ...formData, title_highlight: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-900 outline-none transition-all font-bold text-blue-800 text-sm shadow-sm"
                                        placeholder="e.g. Bharuch"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Section Subtitle</label>
                                <input
                                    value={formData.section_subtitle}
                                    onChange={e => setFormData({ ...formData, section_subtitle: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-900 outline-none transition-all text-sm"
                                    placeholder="e.g. The Head of the House"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Main Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-900 outline-none transition-all resize-none text-sm leading-relaxed"
                                    placeholder="His Royal Highness serves as..."
                                />
                            </div>

                            {/* Media Section - Compact Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
                                <div className="sm:col-span-2 space-y-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Portrait Source (URL)</label>
                                        <input
                                            type="url"
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-900 outline-none transition-all text-xs"
                                            placeholder="https://example.com/portrait.webp"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Image Caption</label>
                                        <input
                                            value={formData.image_caption}
                                            onChange={e => setFormData({ ...formData, image_caption: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-900 outline-none transition-all text-xs italic"
                                            placeholder="e.g. Formal recognition portrait, 2024"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Role Badge</label>
                                        <input
                                            value={formData.role_bottom}
                                            onChange={e => setFormData({ ...formData, role_bottom: e.target.value })}
                                            className="w-full bg-emerald-50/50 border border-emerald-100 rounded-lg p-2 focus:ring-2 focus:ring-blue-900 outline-none transition-all font-bold text-center text-emerald-700 text-xs italic shadow-sm"
                                            placeholder="e.g. Sovereign Head"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-lg shadow-blue-900/5 bg-slate-50 flex-shrink-0">
                                        {formData.image_url ? (
                                            <Image src={formData.image_url} alt="Portrait Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${formData.is_visible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                    <span className="text-xs font-bold text-slate-600">Public Display</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={!!formData.is_visible}
                                        onChange={e => setFormData({ ...formData, is_visible: e.target.checked ? 1 : 0 })}
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-blue-900/20 active:scale-95 transition-all text-sm"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingId ? "Update Record" : "Enshrine Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
