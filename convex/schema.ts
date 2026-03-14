import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Configuration iAsted
  iasted_config: defineTable({
    agentId: v.optional(v.string()),
    presidentVoiceId: v.optional(v.string()),
    ministerVoiceId: v.optional(v.string()),
    defaultVoiceId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Sessions de conversation
  conversation_sessions: defineTable({
    userId: v.optional(v.string()),
    settings: v.optional(v.any()),
    focusMode: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Messages de conversation
  conversation_messages: defineTable({
    sessionId: v.id("conversation_sessions"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});
