"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Admin {
    id: number;
    email: string;
    created_at: string;
}

export default function AdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetch("/api/admins");
            if (res.ok) {
                setAdmins(await res.json());
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        setError("");

        try {
            const res = await fetch("/api/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newEmail }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to add admin");
            }

            setNewEmail("");
            fetchAdmins();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this admin access?")) return;

        try {
            await fetch(`/api/admins?id=${id}`, { method: "DELETE" });
            setAdmins(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert("Failed to delete admin");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-blue-950">Privileged Access</h1>
                    <p className="text-slate-500 mt-1">Manage administrators authorized to access this dashboard.</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-800">
                    <Shield className="w-6 h-6" />
                </div>
            </div>

            {/* Add Admin Form */}
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
                <h2 className="text-lg font-bold text-blue-900 mb-4">Authorize New Personnel</h2>
                <form onSubmit={handleAdd} className="flex gap-4 items-start">
                    <div className="flex-1">
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter email address"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-blue-950"
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={adding}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Grant Access
                    </button>
                </form>
            </div>

            {/* Admins List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Active Administrators</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{admins.length} Users</span>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Loading records...
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {admins.map((admin) => (
                            <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold border-2 border-white shadow-sm">
                                        {admin.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{admin.email}</p>
                                        <p className="text-xs text-slate-400">Added {new Date(admin.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(admin.id)}
                                    className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Revoke Access"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {admins.length === 0 && (
                            <div className="p-8 text-center text-slate-400">No admins found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
