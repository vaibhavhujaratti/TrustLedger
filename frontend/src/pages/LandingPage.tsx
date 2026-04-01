import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui/core";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-5xl mx-auto space-y-16">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 font-sans">
          Get Paid. <span className="text-trust-green">Every Time.</span>
        </h1>
        <p className="text-xl text-gray-600">
          Smart escrow for student freelancers. Stop chasing invoices and focus on building.
        </p>
        <div className="pt-4">
          <Button variant="primary" className="text-lg px-8 py-3 w-full sm:w-auto" onClick={() => navigate("/register")}>
            Start Free Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <Card className="flex flex-col items-center p-8 space-y-4">
          <div className="text-4xl">🔐</div>
          <h3 className="text-lg font-bold">Escrow Locked</h3>
          <p className="text-sm text-gray-600">Clients deposit funds upfront. You only work when the money is safely locked in the vault.</p>
        </Card>
        <Card className="flex flex-col items-center p-8 space-y-4">
          <div className="text-4xl">📋</div>
          <h3 className="text-lg font-bold">Milestones</h3>
          <p className="text-sm text-gray-600">Our AI splits your project into clear, unambiguous deliverables protecting scope creep.</p>
        </Card>
        <Card className="flex flex-col items-center p-8 space-y-4">
          <div className="text-4xl">⚖️</div>
          <h3 className="text-lg font-bold">Fair Disputes</h3>
          <p className="text-sm text-gray-600">If things go wrong, our AI mediator suggests fair splits. No more ghosting.</p>
        </Card>
      </div>
    </div>
  );
}
