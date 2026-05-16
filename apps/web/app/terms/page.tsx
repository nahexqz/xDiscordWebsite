import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28">
        <h1 className="font-display text-4xl font-black text-white mb-8">Terms of Service</h1>
        <div className="glass-card neon-border p-8 space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Legendary Community, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">2. Discord Integration</h2>
            <p>Our platform integrates with Discord. You must have a valid Discord account to use our services. We access only the data you authorize through Discord OAuth2.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">3. Payments and Refunds</h2>
            <p>All purchases of Discord roles are final unless there is a technical failure on our end. Payments are processed in Thai Baht (THB) through Stripe. We do not store your payment information.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">4. Verification Policy</h2>
            <p>Users submitting verification must provide accurate and truthful information. Submitting false information, impersonating others, or using fake documents is strictly prohibited and will result in a permanent ban.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">5. Community Rules</h2>
            <p>Users must follow our community guidelines including: no harassment, no spam, no illegal content, and respectful conduct toward all members.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">6. Account Termination</h2>
            <p>We reserve the right to terminate accounts that violate these terms without prior notice.</p>
          </section>
          <p className="text-xs text-white/30">Last updated: January 2025</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
