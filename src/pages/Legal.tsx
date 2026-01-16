import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Legal() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <h1 className="text-4xl font-black mb-8">
              <span className="text-gradient">Legal Disclaimer</span>
            </h1>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">General Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  $HORNY is a meme token created for entertainment purposes only. This website and its content 
                  do not constitute financial advice, investment advice, trading advice, or any other sort of advice. 
                  You should not treat any of the website's content as such.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">No Investment Advice</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The information provided on this website does not constitute investment advice, financial advice, 
                  trading advice, or any other sort of advice. You should not treat any of the website's content as such. 
                  The $HORNY team does not recommend that any cryptocurrency should be bought, sold, or held by you. 
                  Do conduct your own due diligence and consult your financial advisor before making any investment decisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Risk Warning</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cryptocurrency investments are volatile and high-risk in nature. Do not invest more than what you can 
                  afford to lose. The value of cryptocurrencies can go down as well as up, and you may lose all of your 
                  investment. Past performance is not an indicator of future results.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Not Financial Advice (NFA)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nothing on this website should be construed as financial advice. All content is for informational and 
                  entertainment purposes only. Always Do Your Own Research (DYOR) before making any financial decisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This website uses localStorage to save your preferences and badge progress locally on your device. We do
                  not collect, store, or transmit any personal information to external servers. Your data stays on your device.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This website may contain links to third-party websites or services that are not owned or controlled by 
                  $HORNY. We have no control over, and assume no responsibility for, the content, privacy policies, or 
                  practices of any third-party websites or services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For any questions or concerns, please reach out through our official social media channels.
                </p>
              </section>

              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
