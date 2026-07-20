import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service · Prodily",
  description: "The terms that govern your use of the Prodily platform.",
};

export default function TermsPage() {
  return (
    <div className="landing min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-medium tracking-tight">
          Terms of <span className="italic font-display gradient-text">Service</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: July 19, 2026</p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-foreground/85">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of terms</h2>
            <p className="mt-3">
              By creating an account or using Prodily, you agree to these Terms of Service on behalf of yourself and
              the organization you represent. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. The service</h2>
            <p className="mt-3">
              Prodily provides an AI powered employee recognition, rewards and engagement platform delivered as a
              hosted software product. We continuously improve the service and may add, modify or remove features at
              our discretion, without materially reducing the core functionality of a paid plan during its term.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Accounts and workspaces</h2>
            <p className="mt-3">
              You are responsible for keeping account credentials confidential and for all activity that happens under
              your account. Workspace administrators are responsible for the users they invite and the content posted
              in their workspace.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Acceptable use</h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc pl-6 space-y-2">
              <li>Use Prodily for anything unlawful, harassing, discriminatory or deceptive.</li>
              <li>Reverse engineer, scrape or attempt to break the security of the platform.</li>
              <li>Upload content that infringes intellectual property or privacy rights.</li>
              <li>Resell the service or use it to build a competing product.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Fees and billing</h2>
            <p className="mt-3">
              Paid plans are billed in advance on a monthly or annual basis and are non refundable except where
              required by law. Reward balances funded by your organization are held for the purpose of paying out
              rewards to your employees and are subject to any applicable vendor terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Your content</h2>
            <p className="mt-3">
              Your organization retains ownership of the data and content it uploads to Prodily. You grant us a
              limited licence to host, process and display that content solely to operate and improve the service,
              including generating recognition suggestions and analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Confidentiality and security</h2>
            <p className="mt-3">
              We treat customer data as confidential and protect it with commercially reasonable technical and
              organizational safeguards. Details are described in our Privacy Policy and our data processing
              addendum, available on request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
            <p className="mt-3">
              You may cancel your subscription at any time from the workspace settings. We may suspend or terminate
              accounts that violate these terms or create risk for other users. Upon termination, we will delete or
              anonymize personal data in line with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Disclaimers</h2>
            <p className="mt-3">
              The service is provided &quot;as is&quot; without warranties of any kind, express or implied. AI generated
              recommendations are suggestions and should be reviewed by a human before acting on them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Limitation of liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by law, Prodily is not liable for indirect, incidental or consequential
              damages. Our total liability for any claim relating to the service is limited to the fees paid by your
              organization in the 12 months preceding the event giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">11. Changes to these terms</h2>
            <p className="mt-3">
              We may update these terms from time to time. When we make material changes, we will notify workspace
              administrators by email and update the &quot;Last updated&quot; date above. Continued use of the service after
              changes take effect constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
            <p className="mt-3">
              Questions about these terms? Email us at{" "}
              <a href="mailto:legal@prodily.com" className="underline hover:text-foreground">legal@prodily.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
