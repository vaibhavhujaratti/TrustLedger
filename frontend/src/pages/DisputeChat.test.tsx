import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../stores/authStore", () => ({
  useAuthStore: () => ({ user: { id: "u1", role: "CLIENT" }, token: "t" }),
}));

vi.mock("../api/useDisputes", () => ({
  useDispute: () => ({ data: { messages: [], aiSummary: null } }),
  useGenerateDisputeAiSummary: () => ({ mutate: vi.fn(), isPending: false }),
  useResolveDispute: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("socket.io-client", () => ({
  io: () => ({
    emit: vi.fn(),
    on: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

describe("DisputeChat", () => {
  it("renders dispute shell", async () => {
    const { default: DisputeChat } = await import("./DisputeChat");
    render(
      <MemoryRouter initialEntries={["/projects/p1/dispute/d1"]}>
        <Routes>
          <Route path="/projects/:projectId/dispute/:id" element={<DisputeChat />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Dispute Raised/i)).toBeInTheDocument();
    expect(screen.getByText(/Mediation Channel/i)).toBeInTheDocument();
  });
});

