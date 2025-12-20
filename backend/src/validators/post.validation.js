import { z } from "zod";

export const createPostSchema = z.object({
	body: z.object({
		title: z.string().min(3).max(200),
		content: z.string().min(1),
		tags: z.array(z.string().min(1)).max(20).optional(),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const updatePostSchema = z.object({
	body: z.object({
		title: z.string().min(3).max(200).optional(),
		content: z.string().min(1).optional(),
		tags: z.array(z.string().min(1)).max(20).optional(),
	}),
	query: z.object({}).optional(),
	params: z.object({ id: z.string().min(1) }),
});

export const listPostsQuerySchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		q: z.string().trim().optional(),
		author: z.string().trim().optional(),
		status: z
			.string()
			.transform((s) => s.toUpperCase())
			.pipe(z.enum(["DRAFT", "PENDING", "PUBLISHED", "DELETED"]))
			.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(50).default(10),
		tag: z.string().optional(),
	}),
	params: z.object({}).optional(),
});

export const addCommentSchema = z.object({
	body: z.object({
		postId: z.string().min(1),
		content: z.string().min(1).max(1000),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const listCommentsQuerySchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		postId: z.string().min(1),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(50).default(10),
	}),
	params: z.object({}).optional(),
});
