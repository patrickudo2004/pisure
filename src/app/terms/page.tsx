import Link from "next/link";

export const metadata = {
  title: "Terms",
  description: "The terms of use for the Pisure platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="mt-2 text-muted">Last updated: September 2026</p>

      <section className="mt-10 space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold">1. For downloaders</h2>
          <p className="mt-2">
            Photos on Pisure are free to download and use under the{" "}
            <Link href="/license" className="text-accent hover:underline">
              CC BY 4.0 license
            </Link>{" "}
            — including commercially — provided you credit the creator.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. For uploaders</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              You confirm you are the author of every photo you upload, or have
              written permission from the author to publish it under CC BY 4.0.
            </li>
            <li>
              If recognizable people appear in your photo, you confirm they have
              consented to its publication and use (a model release).
            </li>
            <li>
              If private property, artwork, or trademarks appear prominently, you
              confirm you have any permission required for commercial licensing.
            </li>
            <li>
              You must not upload photos of people in private or vulnerable
              situations without consent, or any unlawful content.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. Moderation & takedowns</h2>
          <p className="mt-2">
            All uploads are reviewed before publication. Pisure may remove any
            photo that breaches these terms. Every asset page has a{" "}
            <strong>Report</strong> action; reports are reviewed by our
            moderators. Rights holders may request takedowns by email at{" "}
            <a href="mailto:takedown@pisure.com" className="text-accent hover:underline">
              takedown@pisure.com
            </a>{" "}
            — please include the asset link and evidence of ownership. We aim to
            act within 5 working days.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. Accounts</h2>
          <p className="mt-2">
            Keep your credentials safe; you are responsible for activity under
            your account. We may suspend accounts that repeatedly breach these
            terms.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. The service</h2>
          <p className="mt-2">
            Pisure is provided “as is”. We may change or discontinue parts of the
            service; we&apos;ll always try to give notice on major changes.
          </p>
        </div>
      </section>
    </div>
  );
}
