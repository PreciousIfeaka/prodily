import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy · Prodily",
  description: "How Prodily collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="landing min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-medium tracking-tight">
          Privacy <span className="italic font-display gradient-text">Policy</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 19, 2026</p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-foreground/85">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p className="mt-3">
              Prodily (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) builds an AI powered employee recognition, rewards and engagement platform.
              This Privacy Policy explains what information we collect when you use our website and product, how we use it,
              who we share it with, and the rights you have over your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Information we collect</h2>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li><span className="text-foreground font-medium">Account data:</span> name, work email, company, role and profile photo.</li>
              <li><span className="text-foreground font-medium">Workspace data:</span> recognitions, rewards, comments, reactions and team structure your organization uploads.</li>
              <li><span className="text-foreground font-medium">Usage data:</span> device type, browser, pages visited, actions taken and approximate location derived from IP.</li>
              <li><span className="text-foreground font-medium">Payment data:</span> billing contact and transaction metadata. Card details are handled by our PCI compliant payment processor and never stored on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. How we use your information</h2>
            <p className="mt-3">We use your information to:</p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Provide, maintain and improve the Prodily platform.</li>
              <li>Generate recognition suggestions, insights and analytics using AI models.</li>
              <li>Process rewards, payouts and vendor fulfilment.</li>
              <li>Communicate product updates, security notices and support responses.</li>
              <li>Detect, investigate and prevent fraud and abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Sharing your information</h2>
            <p className="mt-3">
              We do not sell your personal data. We share information only with trusted sub processors that host our
              infrastructure, deliver rewards, or provide analytics and communication tooling, and only to the extent
              necessary to operate the service. We may disclose data when required by law or to protect the safety of
              our users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Data retention</h2>
            <p className="mt-3">
              We retain workspace data for as long as your organization has an active Prodily account. When an account
              is closed, we delete or anonymize personal data within 90 days, except where longer retention is required
              by law or for legitimate business records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Your rights</h2>
            <p className="mt-3">
              Depending on your location, you may have the right to access, correct, export or delete your personal data,
              and to object to or restrict certain processing. To exercise these rights, contact your workspace
              administrator or email us at privacy@prodily.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Security</h2>
            <p className="mt-3">
              Prodily encrypts data in transit and at rest, enforces role based access control, and continuously monitors
              our infrastructure. No system is perfectly secure, so we encourage strong passwords and multi factor
              authentication for every account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Changes to this policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. When we make material changes, we will notify
              workspace administrators by email and update the &quot;Last updated&quot; date above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Contact us</h2>
            <p className="mt-3">
              Questions about this policy? Reach us at{" "}
              <a href="mailto:privacy@prodily.com" className="underline hover:text-foreground">privacy@prodily.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
