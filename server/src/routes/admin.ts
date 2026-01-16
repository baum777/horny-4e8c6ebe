import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { GamificationStoreSupabase, defaultUserStats } from "../store/gamificationStoreSupabase";
import { logger } from "../utils/logger";
import type { AuthenticatedRequest } from "../middleware/auth";
import { requireAuth } from "../middleware/auth";
import { applyAction } from "../gamification/engine";
import type { ActionType, ActionContext } from "../gamification/types";
import { config } from "../config";
import type { Database } from "../types/supabase";

export const adminRouter = Router();

const store = new GamificationStoreSupabase();
const supabaseAdmin = createClient<Database>(config.supabase.url, config.supabase.serviceRoleKey);

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function resetDaily(stats: ReturnType<typeof defaultUserStats>, now: Date) {
  stats.dailyHornyEarned = 0;
  for (const key of Object.keys(stats.counts)) {
    if (key.startsWith("horny_daily_")) stats.counts[key] = 0;
  }
  stats.counts.horny_daily_reset_at = Math.floor(now.getTime() / 1000);
}

function resetWeekly(stats: ReturnType<typeof defaultUserStats>, now: Date) {
  stats.weeklyHornyEarned = 0;
  for (const key of Object.keys(stats.counts)) {
    if (key.startsWith("horny_weekly_")) stats.counts[key] = 0;
  }
  stats.counts.horny_weekly_reset_at = Math.floor(now.getTime() / 1000);
}

// Simple admin check (replace with proper role-based auth)
function isAdmin(req: AuthenticatedRequest): boolean {
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(",").map((id) => id.trim()).filter(Boolean) || [];
  if (req.userId && adminUserIds.includes(req.userId)) return true;

  const metadata = req.appMetadata ?? req.userMetadata ?? {};
  const role = typeof metadata.role === "string" ? metadata.role : undefined;
  const roles = Array.isArray((metadata as { roles?: unknown }).roles)
    ? ((metadata as { roles: unknown[] }).roles).filter((r) => typeof r === "string")
    : [];
  const isAdminFlag =
    (metadata as { is_admin?: unknown }).is_admin === true ||
    (metadata as { admin?: unknown }).admin === true;

  return role === "admin" || role === "owner" || roles.includes("admin") || roles.includes("owner") || isAdminFlag;
}

adminRouter.use(requireAuth);
adminRouter.use((req, res, next) => {
  if (!isAdmin(req as AuthenticatedRequest)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
});

// Manual adjustment endpoint
adminRouter.post("/adjust", async (req, res) => {
  try {
    const { userId, adjustments } = req.body;

    if (!userId || !adjustments) {
      return res.status(400).json({ error: "userId and adjustments required" });
    }

    const nowISO = new Date().toISOString();
    const stats = await store.getOrCreate(userId, nowISO);

    // Apply adjustments
    const updated = { ...stats };
    if (adjustments.pendingHorny !== undefined) {
      // This would add to a pending balance (not lifetime)
      // For now, we'll log it as a special event
      logger.info("admin_adjustment", {
        adminUserId: (req as AuthenticatedRequest).userId,
        targetUserId: userId,
        adjustment: adjustments,
      });

      // Create a manual adjustment event
      await store.saveWithTransaction(userId, updated, {
        action: "special",
        payload: { type: "admin_adjustment", adjustments },
        deltaHorny: adjustments.pendingHorny || 0,
        levelBefore: stats.level,
        levelAfter: stats.level,
        capsApplied: {},
        badgesUnlocked: [],
        featuresUnlocked: [],
        status: "applied",
      });
    }

    if (adjustments.level !== undefined) {
      updated.level = adjustments.level;
    }

    if (adjustments.revokeBadge) {
      updated.unlockedBadges = updated.unlockedBadges.filter(
        (b) => b !== adjustments.revokeBadge
      );
    }

    if (adjustments.revokeFeature) {
      updated.unlockedFeatures = updated.unlockedFeatures.filter(
        (f) => f !== adjustments.revokeFeature
      );
    }

    await store.save(userId, updated);

    res.json({ success: true, stats: updated });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error("admin_adjustment_failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Rebuild stats from events (recovery)
adminRouter.post("/rebuild-stats", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const { data: events, error } = await supabaseAdmin
      .from("gamification_events")
      .select("action, payload, created_at, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    let stats = defaultUserStats(userId);
    let currentDay: string | null = null;
    let currentWeek: string | null = null;

    for (const event of events ?? []) {
      if (event.status !== "applied") continue;

      const eventTime = event.created_at ? new Date(event.created_at) : new Date();
      const dayKey = startOfDay(eventTime);
      const weekKey = startOfWeek(eventTime);

      if (currentDay !== dayKey) {
        resetDaily(stats, eventTime);
        currentDay = dayKey;
      }
      if (currentWeek !== weekKey) {
        resetWeekly(stats, eventTime);
        currentWeek = weekKey;
      }

      const payload = (event.payload ?? {}) as Record<string, unknown>;
      const ctx: ActionContext = {
        nowISO: eventTime.toISOString(),
        idempotencyKey: (payload.idempotencyKey as string) ?? `rebuild:${eventTime.toISOString()}:${event.action}`,
        artifactId: payload.artifactId as string | undefined,
        receivedVotesDelta: payload.receivedVotesDelta as number | undefined,
        timeDeltaSeconds: payload.timeDeltaSeconds as number | undefined,
      };

      const { next } = applyAction(stats, event.action as ActionType, ctx);
      stats = next;
    }

    await store.save(userId, stats);

    logger.info("admin_rebuild_stats", {
      adminUserId: (req as AuthenticatedRequest).userId,
      targetUserId: userId,
    });

    res.json({ success: true, stats });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error("admin_rebuild_failed", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

