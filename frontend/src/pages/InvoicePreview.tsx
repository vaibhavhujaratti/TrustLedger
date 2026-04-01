import React from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Spinner } from "../components/ui/core";
import { useCreateInvoice, useInvoice } from "../api/useInvoices";
import { useProject } from "../api/useProjects";

export default function InvoicePreview() {
  const { projectId } = useParams();
  const { data: project, isLoading: projectLoading } = useProject(projectId || "");
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();
  const { data: invoice } = useInvoice(projectId || "");

  const allMilestonesReleased = project?.milestones?.every(
    (m) => m.status === "FUNDS_RELEASED" || m.status === "APPROVED"
  );

  const handleDownload = () => {
    if (!projectId) return;
    createInvoice(projectId, {
      onSuccess: (data) => {
        const binaryString = atob(data.pdfPayload);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto py-10 text-center">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  if (!allMilestonesReleased) {
    return (
      <div className="max-w-4xl mx-auto py-6 lg:py-10">
        <Card className="p-8 lg:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invoice Not Available</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Invoice cannot be generated until all milestones are released.
          </p>
          <div className="inline-block p-4 bg-secondary-50 rounded-xl space-y-2 text-left">
            {(project.milestones ?? []).map((m) => (
              <div key={m.id} className="flex justify-between gap-8 text-sm">
                <span className="text-gray-700">{m.title}</span>
                <span className={m.status === "FUNDS_RELEASED" ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                  {m.status === "FUNDS_RELEASED" ? "Released" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 lg:py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoice</h1>
          <p className="text-sm text-gray-500 mt-1">Escrow payment receipt</p>
        </div>
        <Button onClick={handleDownload} variant="primary" disabled={isCreating}>
          {isCreating ? <Spinner size="sm" /> : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {isCreating ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <Card className="p-8 lg:p-12 shadow-xl border border-secondary-100">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-secondary-100 pb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-brand-600">Trust-Bound</h2>
            <p className="text-sm text-gray-500 mt-1">Escrow Payment Receipt</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-bold text-gray-900">INVOICE</p>
            <p className="text-sm text-brand-600 font-mono">{invoice?.invoiceNumber ?? "—"}</p>
            <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
          </div>
        </div>

        <div className="py-6 border-b border-secondary-100">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{project.title}</h3>
          <p className="text-sm text-gray-500">{project.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between py-6 gap-6">
          <div>
            <h3 className="font-semibold text-xs uppercase text-gray-400 tracking-wider mb-3">Client</h3>
            <p className="font-semibold text-gray-900">{project.client?.displayName ?? "Client"}</p>
            {project.client?.upiHandle && (
              <p className="text-sm text-gray-500 mt-1">UPI: {project.client.upiHandle}</p>
            )}
          </div>
          <div className="sm:text-right">
            <h3 className="font-semibold text-xs uppercase text-gray-400 tracking-wider mb-3">Freelancer</h3>
            <p className="font-semibold text-gray-900">{project.freelancer?.displayName ?? "Freelancer"}</p>
            {project.freelancer?.upiHandle && (
              <p className="text-sm text-gray-500 mt-1">UPI: {project.freelancer.upiHandle}</p>
            )}
          </div>
        </div>

        <table className="w-full text-left mt-4">
          <thead>
            <tr className="border-b-2 border-secondary-200">
              <th className="py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Milestone</th>
              <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Released On</th>
            </tr>
          </thead>
          <tbody>
            {(project.milestones ?? []).map((m) => (
              <tr key={m.id} className="border-b border-secondary-50">
                <td className="py-4 text-sm text-gray-700">{m.title}</td>
                <td className="py-4 text-right font-medium text-gray-900">₹{Number(m.amount).toLocaleString()}</td>
                <td className="py-4 text-right text-gray-500 text-sm">
                  {m.approvedAt ? new Date(m.approvedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </td>
              </tr>
            ))}
            <tr className="border-b border-secondary-100">
              <td className="py-4 font-bold text-gray-900">Total</td>
              <td className="py-4 text-right font-bold text-brand-600 text-xl">
                ₹{Number(project.totalBudget).toLocaleString()}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
