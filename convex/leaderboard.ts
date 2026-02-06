import { query } from "./_generated/server";

// Get top players
export const getTop = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_score")
      .order("desc")
      .take(10);
    return entries;
  },
});
