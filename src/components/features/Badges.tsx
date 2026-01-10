import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { badgeDefinitions, getRarityColor, getRarityBorderColor, type BadgeDefinition } from '@/content/badgeDefinitions';
import { getBadges, unlockBadge } from '@/lib/storage';
import { generateBadgeCard, downloadImage } from '@/lib/canvasCard';
import { openXShare, copyToClipboard, getBadgeShareText, getShareUrl } from '@/lib/share';
import { toast } from 'sonner';

export default function Badges() {
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, { unlockedAt: string | null }>>({});
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUnlockedBadges(getBadges());
    
    // Check for time-based badge periodically
    const interval = setInterval(() => {
      setUnlockedBadges(getBadges());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isUnlocked = (badgeId: string) => {
    return !!unlockedBadges[badgeId]?.unlockedAt;
  };

  const unlockedCount = badgeDefinitions.filter(b => isUnlocked(b.id)).length;
  const progress = (unlockedCount / badgeDefinitions.length) * 100;

  const handleShare = async (badge: BadgeDefinition) => {
    if (!isUnlocked(badge.id)) return;
    
    unlockBadge('first-share');
    openXShare({
      text: getBadgeShareText(badge.name, badge.rarity),
      url: getShareUrl('/interact#badges'),
    });
  };

  const handleCopy = async (badge: BadgeDefinition) => {
    const shareText = `${getBadgeShareText(badge.name, badge.rarity)}\n${getShareUrl('/interact#badges')}`;
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async (badge: BadgeDefinition) => {
    try {
      const imageData = await generateBadgeCard(badge.name, badge.rarity, badge.description);
      downloadImage(imageData, `badge-${badge.id}.png`);
      toast.success('Badge card downloaded!');
    } catch {
      toast.error('Failed to generate badge card');
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Badge Collection</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} of {badgeDefinitions.length} unlocked
            </p>
          </div>
          <div className="text-3xl font-black text-gradient">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-horny"
          />
        </div>
      </GlassCard>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badgeDefinitions.map((badge, index) => {
          const unlocked = isUnlocked(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => unlocked && setSelectedBadge(badge)}
                className={`w-full text-left transition-all duration-300 ${
                  unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <GlassCard
                  className={`relative overflow-hidden h-full p-4 ${
                    unlocked
                      ? `border ${getRarityBorderColor(badge.rarity)} hover:scale-[1.02]`
                      : 'opacity-50 grayscale'
                  }`}
                >
                  {/* Locked overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Badge content */}
                  <div className="text-center">
                    <span className="text-4xl block mb-2">{badge.icon}</span>
                    <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                    <span className={`text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                </GlassCard>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard variant="neon" className="text-center">
              <span className="text-6xl block mb-4">{selectedBadge.icon}</span>
              <h3 className="text-2xl font-bold mb-2">{selectedBadge.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(selectedBadge.rarity)} bg-current/10 mb-4`}>
                {selectedBadge.rarity}
              </span>
              <p className="text-muted-foreground mb-6">{selectedBadge.description}</p>

              <div className="space-y-3">
                <Button variant="gradient" className="w-full" onClick={() => handleShare(selectedBadge)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Badge
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleCopy(selectedBadge)}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleDownload(selectedBadge)}>
                    Download
                  </Button>
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setSelectedBadge(null)}>
                  Close
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* How to unlock */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-4">How to Unlock</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {badgeDefinitions.map((badge) => (
            <div
              key={badge.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isUnlocked(badge.id) ? 'bg-primary/10' : 'bg-muted/50'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.unlockCondition}</p>
              </div>
              {isUnlocked(badge.id) && (
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
