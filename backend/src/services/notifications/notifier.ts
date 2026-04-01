import { prisma } from "../../lib/prisma";

type NotificationInput = {
  userId: string;
  title: string;
  body: string;
  type: string;
  linkPath?: string | null;
};

/**
 * Create a notification row for a user.
 * Side effects: inserts into DB only (Socket broadcast is optional in prototype).
 */
export async function notify(input: NotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      linkPath: input.linkPath ?? null,
    },
  });
}

