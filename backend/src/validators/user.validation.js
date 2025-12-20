import { z } from "zod";

export const updateProfileSchema = z.object({
	body: z.object({
		name: z.string().min(1).max(100).optional(),
		photoUrl: z.string().url().optional(),
		bio: z.string().max(1000).optional(),
		visibility: z
			.string()
			.transform((s) => s.toUpperCase())
			.pipe(z.enum(["PUBLIC", "PRIVATE", "CONNECTIONS"]))
			.optional(),
		// Back-compat: allow boolean `visible` and map it to PUBLIC/PRIVATE
		visible: z.boolean().optional(),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const directoryQuerySchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		q: z.string().trim().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(50).default(10),
	}),
	params: z.object({}).optional(),
});
