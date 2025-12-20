import { z } from "zod";

export const registerSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(6),
		name: z.string().min(1).max(100).optional(),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const loginSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(6),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const requestResetSchema = z.object({
	body: z.object({
		email: z.string().email(),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const confirmResetSchema = z.object({
	body: z.object({
		token: z.string().min(10),
		newPassword: z.string().min(6),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});
