import { z } from 'zod';
import { identifierSchema, parseWithSchema, type Result } from './common';

export const verifiedIdentitySchema = z.object({ uid: identifierSchema, emailVerified: z.literal(true) }).strict();
export type VerifiedIdentity = z.infer<typeof verifiedIdentitySchema>;
export const tripMemberSchema = z.object({ tripId: identifierSchema, uid: identifierSchema }).strict();
export type TripMember = z.infer<typeof tripMemberSchema>;

export function parseVerifiedIdentity(input: unknown): Result<VerifiedIdentity> { return parseWithSchema(verifiedIdentitySchema, input); }
export function parseTripMember(input: unknown): Result<TripMember> { return parseWithSchema(tripMemberSchema, input); }
