import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-28">
        <h1 className="font-display text-4xl font-black text-white mb-8">Privacy Policy</h1>
        <div className="glass-card neon-border p-8 space-y-6 text-white/70 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">1. Data We Collect</h2>
            <p>We collect the following data when you log in with Discord: username, email address, Discord user ID, avatar, and account creation date. For verification, we collect personal identification information you voluntarily submit.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide and improve our services</li>
              <li>To process payments through Stripe</li>
              <li>To verify your identity when you submit verification</li>
              <li>To send you important service notifications via Discord DM</li>
              <li>To maintain community safety and security</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">3. Data Security</h2>
            <p>Verification documents (selfies, ID cards) are stored encrypted on Cloudinary and only accessible to authorized administrators. We use industry-standard security practices including HTTPS, httpOnly cookies, and JWT authentication.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p>We use: Discord (authentication), Stripe (payments), Cloudinary (file storage), Firebase (phone verification). Each has their own privacy policy.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">5. Data Retention</h2>
            <p>We retain your data as long as your account is active. You may request deletion of your account and data by contacting our support team.</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">6. Contact</h2>
            <p>For privacy-related requests, contact us via our Discord support ticket system.</p>
          </section>
          <p className="text-xs text-white/30">Last updated: January 2025</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
