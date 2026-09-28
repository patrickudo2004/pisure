export const metadata = {
  title: "License",
  description:
    "All photos on Pisure are licensed under Creative Commons Attribution 4.0 (CC BY 4.0).",
};

export default function LicensePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">The Pisure License</h1>
      <p className="mt-2 text-muted">
        Every photo on Pisure is published under{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Creative Commons Attribution 4.0 (CC BY 4.0)
        </a>
        .
      </p>

      <section className="mt-10 space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold">You are free to:</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Share</strong> — copy and redistribute the material in any
              medium or format, for any purpose, including commercially.
            </li>
            <li>
              <strong>Adapt</strong> — remix, transform, and build upon the
              material for any purpose, including commercially.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Under the following term:</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Attribution</strong> — you must give appropriate credit to
              the creator, provide a link to the license, and indicate if changes
              were made. You may do so in any reasonable manner.
            </li>
          </ul>
        </div>

        <div className="rounded-lg bg-surface p-4">
          <p className="font-medium">Suggested credit</p>
          <p className="mt-1 text-muted">
            “Photo title” by creator on Pisure, licensed under CC BY 4.0 — every
            asset page has a one-click <em>Copy attribution</em> button.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">No warranties</h2>
          <p className="mt-2">
            The licensor (the uploader) makes no warranty that the photo suits
            your use case, and is not liable for any use of the photo. You are
            responsible for your use — including any release requirements for
            recognizable people or property.
          </p>
        </div>
      </section>
    </div>
  );
}
