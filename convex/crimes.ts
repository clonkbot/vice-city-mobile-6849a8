import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Report a crime (shows in feed)
export const report = mutation({
  args: {
    playerId: v.id("players"),
    playerName: v.string(),
    crimeType: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("crimeReports", {
      playerId: args.playerId,
      playerName: args.playerName,
      crimeType: args.crimeType,
      location: args.location,
      timestamp: Date.now(),
    });
  },
});

// Get recent crime reports
export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("crimeReports")
      .withIndex("by_time")
      .order("desc")
      .take(10);
  },
});

// Log mission completion
export const logMission = mutation({
  args: {
    playerId: v.id("players"),
    missionType: v.string(),
    cashEarned: v.number(),
    respectEarned: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("missions", {
      playerId: args.playerId,
      missionType: args.missionType,
      cashEarned: args.cashEarned,
      respectEarned: args.respectEarned,
      completedAt: Date.now(),
    });
  },
});
