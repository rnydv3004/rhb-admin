"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
    const router = useRouter();
    const [familyTreePhoto, setFamilyTreePhoto] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                setFamilyTreePhoto(data.family_tree_photo || "");
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const processUrl = (url: string) => {
        // Convert Google Drive view URLs to thumbnail direct URLs
        const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=)|docs\.google\.com\/file\/d\/)([-_\w]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
        }
        return url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage("");

        const processedUrl = processUrl(familyTreePhoto);

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ family_tree_photo: processedUrl })
            });

            if (res.ok) {
                setFamilyTreePhoto(processedUrl);
                setSuccessMessage("Settings saved successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen font-sans bg-slate-50/30">
            <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-900 transition-colors mb-6 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <div className="border-b border-slate-100 pb-6 mb-8">
                    <h1 className="text-3xl font-serif font-bold text-blue-950">Site Settings</h1>
                    <p className="text-slate-500 mt-1">Configure general website assets and settings.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Family Tree Photo URL
                        </label>
                        <input
                            type="text"
                            value={familyTreePhoto}
                            onChange={(e) => setFamilyTreePhoto(e.target.value)}
                            placeholder="Enter image URL or Google Drive share link..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                            You can paste standard web image links or Google Drive share links. Google Drive links will be automatically optimized for web performance.
                        </p>
                    </div>

                    {familyTreePhoto && (
                        <div>
                            <span className="block text-sm font-bold text-slate-700 mb-3">Preview</span>
                            <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 max-h-[400px] flex items-center justify-center p-4">
                                <img
                                    src={processUrl(familyTreePhoto)}
                                    alt="Family Tree Preview"
                                    className="max-h-[350px] w-auto object-contain rounded-lg shadow-sm"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-900 text-yellow-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 active:scale-95"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
