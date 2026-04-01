import React from "react";
import { useParams } from "react-router-dom";
import { Button, Card } from "../components/ui/core";
import { useCreateInvoice } from "../api/useInvoices";

export default function InvoicePreview() {
  const { projectId } = useParams();
  const { mutate, isPending } = useCreateInvoice();

  const handleGenerate = () => {
    mutate(projectId!, {
      onSuccess: (data) => {
        // Mocking the download response behavior mapped from base64
        console.log("PDF Triggered", data.pdfPayload);
        alert("Invoice generated safely to DB and downloaded.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-serif text-gray-800">Final Invoice</h1>
        <Button onClick={handleGenerate} variant="primary" disabled={isPending}>{isPending ? "Generating..." : "Download PDF ⬇"}</Button>
      </div>

      <Card className="p-12 shadow-xl border-gray-200">
        <div className="flex justify-between items-start border-b pb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-trust-green">Trust-Bound</h2>
            <p className="text-gray-500">Simulated Escrow Receipt</p>
          </div>
          <div className="text-right">
            <p className="font-bold">INVOICE: TB-2026-0042</p>
            <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-between py-10">
          <div>
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-lg">Acme Corp (Client)</p>
            <p className="text-gray-600">client@example.com</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Billed By</h3>
            <p className="font-bold text-lg">Arjun Freelancer</p>
            <p className="text-gray-600">arjun@ybl</p>
          </div>
        </div>

        <table className="w-full text-left mt-4 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-3">Milestone</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4">Design System</td>
              <td className="py-4 text-right">₹5,000</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4">Frontend</td>
              <td className="py-4 text-right">₹10,000</td>
            </tr>
            <tr className="border-b border-gray-300 font-bold">
              <td className="py-4">Total</td>
              <td className="py-4 text-right text-trust-green text-xl">₹15,000</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
