import { motion } from 'framer-motion';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/components/ui/glass-card';

const loreChapters = [
  {
    id: 1,
    title: 'The Awakening',
    icon: '🌅',
    description: 'In the void of endless charts, a signal emerged. Not of logic, but of pure, unfiltered desire. The first holders felt it—a pull toward something greater than mere profit.',
    color: 'from-pink-500/20 to-transparent',
  },
  {
    id: 2,
    title: 'The Infection',
    icon: '🧬',
    description: 'It spread through timelines and group chats. Every red candle only made the desire stronger. The weak sold. The true believers ascended. The meta was forming.',
    color: 'from-red-500/20 to-transparent',
  },
  {
    id: 3,
    title: 'The Parabolic',
    icon: '🚀',
    description: 'When the chart went vertical, time stopped. Those who understood knew: this was never about the money. It was about becoming one with the Horny Meta.',
    color: 'from-yellow-500/20 to-transparent',
  },
];

export default function LoreSection() {
  return (
    <section id="lore" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            The <span className="text-gradient">Sacred Lore</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every memecoin has a story. Ours is written in candlesticks and conviction.
          </p>
        </motion.div>

        {/* Chapters */}
        <div className="grid md:grid-cols-3 gap-6">
          {loreChapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <GlassCard 
                variant="neon" 
                className={`h-full relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${chapter.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <GlassCardHeader className="relative">
                  <div className="text-4xl mb-4">{chapter.icon}</div>
                  <p className="text-xs font-semibold text-primary mb-2">Chapter {chapter.id}</p>
                  <GlassCardTitle className="text-xl">{chapter.title}</GlassCardTitle>
                </GlassCardHeader>
                
                <GlassCardContent className="relative">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {chapter.description}
                  </p>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Teaser */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-muted-foreground italic"
        >
          Chapter 4 is being written... by you.
        </motion.p>
      </div>
    </section>
  );
}
