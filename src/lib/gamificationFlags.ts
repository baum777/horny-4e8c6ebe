export const clientGamificationEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_CLIENT_GAMIFICATION !== 'false';

export const gamificationDemoEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_GAMIFICATION_DEMO !== 'false';
