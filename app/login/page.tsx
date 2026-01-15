"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setStep("otp");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Invalid OTP");
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl border border-blue-100 shadow-2xl shadow-blue-900/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-950 rounded-full mx-auto mb-4 flex items-center justify-center text-yellow-500 text-3xl font-serif font-bold border-4 border-yellow-500/20">R</div>
                    <h1 className="text-2xl font-serif text-blue-950 mb-2">Royal House of Bharuch</h1>
                    <p className="text-slate-500 text-sm tracking-widest uppercase">Authorized Access</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
                        {error}
                    </div>
                )}

                {step === "email" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-900/80 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-blue-950 placeholder:text-slate-400"
                                    placeholder="admin@royalhouse.com"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 hover:bg-blue-800 text-yellow-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 border border-transparent hover:border-yellow-500/50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Login Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-900/80 mb-1">Enter OTP Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-blue-950 tracking-widest"
                                    placeholder="******"
                                    maxLength={6}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Code sent to <span className="text-blue-700 font-medium">{email}</span>
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full text-sm text-slate-500 hover:text-blue-900 transition-colors"
                        >
                            Back to Email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
