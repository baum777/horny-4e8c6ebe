-- Enable RLS for gamification-related tables and add minimal access policies.

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_previews ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own stats and badges.
CREATE POLICY "Users can view their own stats"
  ON public.user_stats
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view their own badges"
  ON public.user_badges
  FOR SELECT
  USING (auth.uid() = user_id);

