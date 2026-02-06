import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get or create player by session ID
export const getOrCreate = mutation({
  args: { sessionId: v.string(), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now() });
      return existing;
    }

    const playerId = await ctx.db.insert("players", {
      name: args.name || `Player_${args.sessionId.slice(0, 6)}`,
      sessionId: args.sessionId,
      cash: 500,
      respect: 0,
      wantedLevel: 0,
      totalMissions: 0,
      totalCrimes: 0,
      carColor: "#ff00ff",
      lastSeen: Date.now(),
    });

    const player = await ctx.db.get(playerId);
    return player;
  },
});

// Get player stats
export const get = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

// Update player stats after mission/crime
export const updateStats = mutation({
  args: {
    playerId: v.id("players"),
    cashDelta: v.number(),
    respectDelta: v.number(),
    wantedDelta: v.number(),
    missionCompleted: v.boolean(),
    crimeCommitted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) throw new Error("Player not found");

    const newCash = Math.max(0, player.cash + args.cashDelta);
    const newRespect = Math.max(0, player.respect + args.respectDelta);
    const newWanted = Math.min(5, Math.max(0, player.wantedLevel + args.wantedDelta));

    await ctx.db.patch(args.playerId, {
      cash: newCash,
      respect: newRespect,
      wantedLevel: newWanted,
      totalMissions: player.totalMissions + (args.missionCompleted ? 1 : 0),
      totalCrimes: player.totalCrimes + (args.crimeCommitted ? 1 : 0),
      lastSeen: Date.now(),
    });

    // Update leaderboard
    const existingEntry = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("playerId"), args.playerId))
      .first();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        score: newRespect,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("leaderboard", {
        playerId: args.playerId,
        playerName: player.name,
        score: newRespect,
        updatedAt: Date.now(),
      });
    }

    return { cash: newCash, respect: newRespect, wantedLevel: newWanted };
  },
});

// Update car color
export const updateCarColor = mutation({
  args: { playerId: v.id("players"), color: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, { carColor: args.color });
  },
});

// Reduce wanted level over time
export const reduceWanted = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player) return;
    if (player.wantedLevel > 0) {
      await ctx.db.patch(args.playerId, {
        wantedLevel: player.wantedLevel - 1,
      });
    }
  },
});
