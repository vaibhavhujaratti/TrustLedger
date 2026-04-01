import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/ui/core";
import { useRegister } from "../api/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"CLIENT" | "FREELANCER">("FREELANCER");
  const [form, setForm] = useState({ email: "", password: "", displayName: "", upiHandle: "" });
  const { mutate: register, isPending, error } = useRegister();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register({ ...form, role }, {
      onSuccess: (data) => navigate(`/${data.user.role.toLowerCase()}-dashboard`)
    });
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-trust-blue to-blue-600 mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2">Get started with Trust-Bound for free</p>
        </div>
        
        <Card className="p-8">
          <div className="flex rounded-xl p-1 bg-gray-100 mb-6">
            <button 
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'FREELANCER' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole("FREELANCER")}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Freelancer
              </span>
            </button>
            <button 
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'CLIENT' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setRole("CLIENT")}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Client
              </span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100">
                {(error as any)?.response?.data?.error || "Registration Failed"}
              </div>
            )}
            
            <Input label="Display Name" required value={form.displayName} onChange={(e: any) => setForm({...form, displayName: e.target.value})} />
            <Input label="Email" type="email" required value={form.email} onChange={(e: any) => setForm({...form, email: e.target.value})} />
            <Input label="Password (min 6 chars)" type="password" required value={form.password} onChange={(e: any) => setForm({...form, password: e.target.value})} />
            <Input label="UPI Handle (Optional)" value={form.upiHandle} onChange={(e: any) => setForm({...form, upiHandle: e.target.value})} placeholder="username@sbi" />

            <Button type="submit" variant="success" className="w-full py-3" disabled={isPending}>
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
