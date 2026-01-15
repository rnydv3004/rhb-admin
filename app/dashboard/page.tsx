"use client";

import { useRouter } from "next/navigation";
import { Newspaper, Image as ImageIcon, Users, LogOut } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    const menuItems = [
        {
            title: "Updates",
            description: "Manage news, announcements, and royal decrees.",
            icon: Newspaper,
            href: "/dashboard/updates",
            color: "bg-blue-50 text-blue-700 border-blue-200",
            iconColor: "text-blue-600",
        },
        {
            title: "Gallery",
            description: "Upload and organize royal event photos.",
            icon: ImageIcon,
            href: "/dashboard/gallery",
            color: "bg-purple-50 text-purple-700 border-purple-200",
            iconColor: "text-purple-600",
        },
        {
            title: "Admins",
            description: "Manage authorized personnel access.",
            icon: Users,
            href: "/dashboard/admins",
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            iconColor: "text-emerald-600",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo placeholder */}
                        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center font-serif text-yellow-500 font-bold shadow-sm ring-2 ring-yellow-500/20">R</div>
                        <h1 className="font-serif text-xl text-blue-950 tracking-tight">Royal House of Bharuch</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h2 className="text-3xl font-serif font-bold mb-2 text-blue-950">Welcome Back</h2>
                    <p className="text-slate-500">Select an area to manage.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <button
                            key={item.title}
                            onClick={() => router.push(item.href)}
                            className="group text-left p-6 rounded-2xl bg-white border border-slate-200 hover:border-yellow-500 transition-all hover:shadow-xl hover:shadow-blue-900/5 relative overflow-hidden"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-blue-900 transition-colors">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>

                            <div className="absolute inset-0 bg-linear-to-br from-yellow-50/0 via-yellow-50/0 to-yellow-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
