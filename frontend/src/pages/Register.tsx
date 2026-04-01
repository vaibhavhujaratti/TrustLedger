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
    <div className="flex bg-surface h-[90vh] items-center justify-center">
      <Card className="w-full max-w-md space-y-6 p-8">
        <h1 className="text-2xl font-bold text-center">Create your account</h1>
        
        <div className="flex rounded-md p-1 bg-gray-100">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md ${role === 'FREELANCER' ? 'bg-white shadow' : 'text-gray-500'}`}
            onClick={() => setRole("FREELANCER")}
          >
            I am a Freelancer
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md ${role === 'CLIENT' ? 'bg-white shadow' : 'text-gray-500'}`}
            onClick={() => setRole("CLIENT")}
          >
            I am a Client
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded">{(error as any)?.response?.data?.error || "Registration Failed"}</div>}
          
          <Input label="Display Name" required value={form.displayName} onChange={(e: any) => setForm({...form, displayName: e.target.value})} />
          <Input label="Email" type="email" required value={form.email} onChange={(e: any) => setForm({...form, email: e.target.value})} />
          <Input label="Password (min 6 chars)" type="password" required value={form.password} onChange={(e: any) => setForm({...form, password: e.target.value})} />
          <Input label="UPI Handle (Optional)" value={form.upiHandle} onChange={(e: any) => setForm({...form, upiHandle: e.target.value})} placeholder="username@sbi" />

          <Button type="submit" variant="success" className="w-full" disabled={isPending}>
            {isPending ? "Signing up..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-trust-blue hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
