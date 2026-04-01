import request from "supertest";
import { app } from "../../src/app";
import { prisma, cleanupTestData } from "../helpers/seed";

describe("Auth Controller", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  const testUser = {
    email: "test@example.com",
    password: "password123",
    role: "CLIENT",
    displayName: "Test Client",
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("should reject duplicate emails", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(400); // Handled by AppError
  });

  it("should successfully log in the registered user", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should reject login for wrong password", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });
});
