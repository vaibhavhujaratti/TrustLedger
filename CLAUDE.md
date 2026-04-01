Trust-Bound escrow platform. Rules for all code generation:

STRUCTURE: See docs/AGENTS.md §3 for complete folder layout.
DATABASE: Prisma ORM only. Never raw SQL. Models in docs/SCHEMA.md.
API: All responses use { success: boolean, data?, error? } envelope.
TESTS: Jest test alongside every feature. Pattern in docs/TDD.md §3.1.
GEMINI: All AI calls via backend/src/services/gemini/ only.
IMPORTS: Use @/ alias (e.g. @/lib/prisma, @/middleware/auth).

Before generating feature code, read:
  1. docs/AGENTS.md
  2. docs/SCHEMA.md
  3. docs/TDD.md
