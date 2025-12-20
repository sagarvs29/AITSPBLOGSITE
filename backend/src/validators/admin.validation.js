import { z } from "zod";

export const listUsersQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    q: z.string().trim().optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
  params: z.object({}).optional(),
});

export const listPostsAdminQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    q: z.string().trim().optional(),
    author: z.string().trim().optional(),
    status: z
      .string()
      .transform((s) => s.toUpperCase())
      .pipe(z.enum(["DRAFT", "PENDING", "PUBLISHED", "DELETED"]))
      .optional(),
    tag: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
  params: z.object({}).optional(),
});

export const getUserParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
});
