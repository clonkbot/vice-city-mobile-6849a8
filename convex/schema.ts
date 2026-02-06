import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Player profiles and stats
  players: defineTable({
    name: v.string(),
    sessionId: v.string(),
    cash: v.number(),
    respect: v.number(),
    wantedLevel: v.number(),
    totalMissions: v.number(),
    totalCrimes: v.number(),
    carColor: v.string(),
    lastSeen: v.number(),
  }).index("by_session", ["sessionId"]).index("by_respect", ["respect"]),

  // Mission completions
  missions: defineTable({
    playerId: v.id("players"),
    missionType: v.string(),
    cashEarned: v.number(),
    respectEarned: v.number(),
    completedAt: v.number(),
  }).index("by_player", ["playerId"]),

  // Global leaderboard entries
  leaderboard: defineTable({
    playerId: v.id("players"),
    playerName: v.string(),
    score: v.number(),
    updatedAt: v.number(),
  }).index("by_score", ["score"]),

  // Crime reports (for multiplayer events)
  crimeReports: defineTable({
    playerId: v.id("players"),
    playerName: v.string(),
    crimeType: v.string(),
    location: v.string(),
    timestamp: v.number(),
  }).index("by_time", ["timestamp"]),
});
