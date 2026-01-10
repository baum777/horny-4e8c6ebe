import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { memeTemplates, accentStyles, type AccentStyle } from '@/content/memeTemplates';
import { generateMemeCard, downloadImage } from '@/lib/canvasCard';
import { openXShare, copyToClipboard, getMemeShareText, getShareUrl } from '@/lib/share';
import { addMeme, getMemes, unlockBadge, type Meme } from '@/lib/storage';
import { addHornyMeter } from '@/components/features/HornyMeter';
import { toast } from 'sonner';

export default function MemeForge() {
  const [selectedTemplate, setSelectedTemplate] = useState(memeTemplates[0].id);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [accentStyle, setAccentStyle] = useState<AccentStyle>('pink');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gallery, setGallery] = useState<Meme[]>([]);

  useEffect(() => {
    setGallery(getMemes());
  }, []);

  const handleGenerate = async () => {
    if (!topText.trim() && !bottomText.trim()) {
      toast.error('Not horny enough. Add some text.');
      return;
    }

    setIsGenerating(true);
    try {
      const imageData = await generateMemeCard(
        selectedTemplate,
        topText,
        bottomText,
        accentStyle
      );
      setGeneratedImage(imageData);

      // Save to gallery
      const newMeme: Meme = {
        id: Date.now().toString(),
        templateId: selectedTemplate,
        topText,
        bottomText,
        accentStyle,
        createdAt: new Date().toISOString(),
        imageData,
      };
      addMeme(newMeme);
      setGallery(getMemes());

      // Unlock badges
      unlockBadge('meme-forged');
      const memeCount = getMemes().length;
      if (memeCount >= 3) {
        unlockBadge('three-memes');
      }

      // Add to horny meter
      addHornyMeter(10);

      toast.success('Meme forged!');
    } catch (error) {
      toast.error('Forge malfunction. Try again.');
    }
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    downloadImage(generatedImage, `horny-meme-${Date.now()}.png`);
  };

  const handleShare = () => {
    unlockBadge('first-share');
    openXShare({
      text: getMemeShareText(),
      url: getShareUrl('/interact'),
    });
  };

  const handleCopy = async () => {
    const shareText = `${getMemeShareText()}\n${getShareUrl('/interact')}`;
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setTopText('');
    setBottomText('');
    setGeneratedImage(null);
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Choose Template</label>
            <div className="grid grid-cols-3 gap-3">
              {memeTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg text-center transition-all border ${
                    selectedTemplate === template.id
                      ? 'bg-primary/20 border-primary'
                      : 'bg-muted/50 border-transparent hover:bg-muted'
                  }`}
                >
                  <span className="text-3xl block mb-1">{template.preview}</span>
                  <span className="text-xs text-muted-foreground">{template.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Top Text</label>
              <Input
                placeholder="When the chart..."
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                maxLength={50}
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Bottom Text</label>
              <Input
                placeholder="...goes parabolic"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                maxLength={50}
                className="bg-muted"
              />
            </div>
          </div>

          {/* Accent Style */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Accent Style</label>
            <div className="flex gap-3">
              {accentStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setAccentStyle(style.id as AccentStyle)}
                  className={`flex-1 p-3 rounded-lg text-center transition-all border ${
                    accentStyle === style.id
                      ? 'border-white'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                  style={{ backgroundColor: style.color + '30' }}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: style.color }}
                  />
                  <span className="text-xs">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            variant="gradient"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Forging...' : '🔥 FORGE MEME'}
          </Button>
        </div>

        {/* Preview */}
        <div>
          <label className="text-sm font-semibold mb-3 block">Preview</label>
          <GlassCard variant="neon" className="aspect-square flex items-center justify-center overflow-hidden">
            {generatedImage ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={generatedImage}
                alt="Generated meme"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <span className="text-6xl block mb-4">
                  {memeTemplates.find(t => t.id === selectedTemplate)?.preview}
                </span>
                <p>Your meme will appear here</p>
              </div>
            )}
          </GlassCard>

          {/* Actions */}
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="flex gap-2">
                <Button variant="gradient" className="flex-1" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="neon" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Link
                </Button>
                <Button variant="ghost" className="flex-1" onClick={handleReset}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Your Meme Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {gallery.map((meme) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                onClick={() => meme.imageData && setGeneratedImage(meme.imageData)}
              >
                {meme.imageData && (
                  <img
                    src={meme.imageData}
                    alt="Meme"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
