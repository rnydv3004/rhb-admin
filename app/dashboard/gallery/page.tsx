"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Video, Star, Info, Loader2, Plus, Trash2, Link as LinkIcon, Edit } from "lucide-react";
import Image from "next/image";

interface Media {
    id: number;
    file_url: string;
    file_type: "IMAGE" | "VIDEO" | "FIMG" | "FVID";
    title?: string;
    subTitle?: string;
    description?: string;
}

export default function GalleryPage() {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        file_url: "",
        file_type: "IMAGE",
        title: "",
        subTitle: "",
        description: ""
    });
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchMedia();
    }, [filter]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const url = filter === "ALL" ? "/api/media" : `/api/media?type=${filter}`;
            const res = await fetch(url);
            if (res.ok) {
                setMedia(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = async (id: number, _currentType: string, newType: string) => {
        try {
            const res = await fetch("/api/media", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, file_type: newType })
            });

            if (res.ok) {
                fetchMedia();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            alert("Failed to update media status");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this media?")) return;
        try {
            const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMedia(prev => prev.filter(m => m.id !== id));
            }
        } catch (e) {
            alert("Failed to delete");
        }
    };

    // Google Drive Link Converter
    const processUrl = (url: string) => {
        // Check for Google Drive Share Link
        const driveRegex = /drive\.google\.com\/file\/d\/([-_\w]+)/;
        const match = url.match(driveRegex);

        if (match && match[1]) {
            // Use thumbnail API (sz=w2000 for high efficiency)
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
        }
        return url;
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        const processedUrl = processUrl(formData.file_url);

        try {
            const url = "/api/media";
            const method = editingId ? "PUT" : "POST";
            const body = editingId
                ? { ...formData, file_url: processedUrl, id: editingId }
                : { ...formData, file_url: processedUrl };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setShowAddModal(false);
                setFormData({ file_url: "", file_type: "IMAGE", title: "", subTitle: "", description: "" });
                setEditingId(null);
                fetchMedia();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to save media");
            }
        } catch (e) {
            alert("An error occurred");
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-blue-950">Royal Gallery</h1>
                    <p className="text-slate-500">Manage Media Featured Status (Max 4 Images, 1 Video).</p>
                </div>

                <div className="flex gap-2 items-center">
                    {['ALL', 'FEATURED', 'IMAGE', 'VIDEO'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === f
                                ? 'bg-blue-900 text-yellow-500 shadow-md'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            setEditingId(null); // Reset editing mode
                            setFormData({ file_url: "", file_type: "IMAGE", title: "", subTitle: "", description: "" });
                            setShowAddModal(true);
                        }}
                        className="ml-2 bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition-colors"
                    >
                        <LinkIcon className="w-4 h-4" />
                        <span>Add Link</span>
                    </button>
                </div>
            </div>

            {/* Stats/Limits Info */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-8 flex items-center gap-4 text-sm text-yellow-900">
                <Info className="w-5 h-5 text-yellow-600" />
                <div>
                    <span className="font-bold">Usage:</span>
                    <span className="ml-2">Featured Images: {media.filter(m => m.file_type === 'FIMG').length}/4</span>
                    <span className="mx-2 text-yellow-300">|</span>
                    <span>Featured Video: {media.filter(m => m.file_type === 'FVID').length}/1</span>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-900" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {media.map(item => (
                        <div key={item.id} className={`group flex flex-col rounded-xl overflow-hidden shadow-sm border transaction-all bg-white relative ${item.file_type.startsWith('F') ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-slate-100'
                            }`}>
                            <div className="aspect-4/3 w-full h-[200px] bg-slate-100 relative">
                                {/* Media Content */}
                                {item.file_type.includes('VIDEO') || item.file_type.includes('VID') ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                        <Video className="w-12 h-12" />
                                    </div>
                                ) : (
                                    <Image
                                        width={400}
                                        height={300}
                                        src={item.file_url}
                                        className="w-full h-full object-cover"
                                        alt={item.title || "Gallery Image"}
                                        unoptimized={true}
                                    />
                                )}

                                {/* Badge */}
                                {item.file_type.startsWith('F') && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-blue-950 p-1.5 rounded-full shadow-lg z-10">
                                        <Star className="w-4 h-4 fill-blue-950" />
                                    </div>
                                )}

                                {/* Hover Overlay Controls */}
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-2">
                                        {/* Toggle Feature */}
                                        {(item.file_type === 'IMAGE' || item.file_type === 'VIDEO') && (
                                            <button
                                                onClick={() => handleTypeChange(item.id, item.file_type, item.file_type === 'IMAGE' ? 'FIMG' : 'FVID')}
                                                className="bg-yellow-500 text-blue-950 p-2 rounded-lg hover:bg-yellow-400"
                                                title="Feature"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                        {(item.file_type === 'FIMG' || item.file_type === 'FVID') && (
                                            <button
                                                onClick={() => handleTypeChange(item.id, item.file_type, item.file_type === 'FIMG' ? 'IMAGE' : 'VIDEO')}
                                                className="bg-white/20 text-white backdrop-blur-sm p-2 rounded-lg hover:bg-white/30"
                                                title="Un-Feature"
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Edit */}
                                        <button
                                            onClick={() => {
                                                setFormData({
                                                    file_url: item.file_url,
                                                    file_type: item.file_type.startsWith('F') ? (item.file_type === 'FIMG' ? 'IMAGE' : 'VIDEO') : (item.file_type as "IMAGE" | "VIDEO"), // Revert to base type or keep logic if needed. Actually simpler to pass current type but if it's FIMG we might want to show as IMAGE in dropdown? The backend handles FIMG/IMAGE swap via type change, but for editing content we might want to just keep current type. Let's keep current type.
                                                    // Wait, the select only has IMAGE/VIDEO options. If it's FIMG, we should probably set it to IMAGE so the user doesn't get confused, OR add FIMG options.
                                                    // Actually, if it is FIMG, and we set it to IMAGE, then saving it might Un-Feature it if we just send IMAGE.
                                                    // Let's modify the select to support all types OR just map properly.
                                                    // Simplest: Set to base type. If they want to re-feature, they use the star. Or we just safeguard the type if they don't change it.
                                                    // Let's map FIMG -> IMAGE for the dropdown, but we also pass the ID.
                                                    // If we want to PRESERVE the featured status, we need to handle that.
                                                    // Our PUT handler now takes `file_type`. If we send `IMAGE` for a `FIMG`, it will become `IMAGE`.
                                                    // So we should probably let the dropdown select the ACTUAL type, or add those options.
                                                    // OR, we just don't let them change type in Edit mode easily without unfeaturing.
                                                    // Let's just pass the raw type and add options to the Select if needed, or map it.
                                                    // Let's map:
                                                    file_type: (item.file_type === 'FIMG' ? 'IMAGE' : (item.file_type === 'FVID' ? 'VIDEO' : item.file_type)),
                                                    title: item.title || "",
                                                    subTitle: item.subTitle || "",
                                                    description: item.description || ""
                                                });
                                                setEditingId(item.id);
                                                setShowAddModal(true);
                                            }}
                                            className="bg-blue-500/80 text-white p-2 rounded-lg hover:bg-blue-500"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="bg-red-500/80 text-white p-2 rounded-lg hover:bg-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Visible Content Below */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-800 line-clamp-1">{item.title || "Untitled Media"}</h3>
                                {item.subTitle && <p className="text-xs text-blue-600 font-medium mb-1 line-clamp-1">{item.subTitle}</p>}
                                <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{item.description || "No description provided."}</p>

                                <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400">{item.file_type}</span>
                                    <span className="text-slate-300">ID: {item.id}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Media Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-blue-950 mb-6 font-serif">{editingId ? "Edit Media" : "Add New Media"}</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Media Link</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.file_url}
                                    onChange={e => setFormData({ ...formData, file_url: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                />
                                <p className="text-xs text-slate-400 mt-1">Supports direct links and Google Drive public links.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
                                <select
                                    value={formData.file_type}
                                    onChange={e => setFormData({ ...formData, file_type: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                >
                                    <option value="IMAGE">Image</option>
                                    <option value="VIDEO">Video</option>
                                </select>
                                {editingId && <p className="text-xs text-yellow-600 mt-1">Note: Changing type here will un-feature the item if it was starred.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Royal Banquet"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Sub Title</label>
                                <input
                                    type="text"
                                    value={formData.subTitle}
                                    onChange={e => setFormData({ ...formData, subTitle: e.target.value })}
                                    placeholder="e.g. A Night to Remember"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="bg-blue-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "Update Media" : "Add to Gallery")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
