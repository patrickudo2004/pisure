import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import AssetGrid from "@/components/AssetGrid";
import { listApprovedAssetsByUploader } from "@/lib/assets";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.username, decodeURIComponent(username).toLowerCase()),
  });
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.fullName ?? profile.username} (@${profile.username})`,
    description:
      profile.bio ??
      `Royalty-free photos by ${profile.fullName ?? profile.username} on Pisure.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const handle = decodeURIComponent(username).toLowerCase();

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.username, handle),
  });
  if (!profile) notFound();

  const assets = await listApprovedAssetsByUploader(profile.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col items-center text-center">
        {profile.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={profile.fullName ?? profile.username}
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <h1 className="mt-4 text-3xl font-bold">{profile.fullName ?? profile.username}</h1>
        <p className="text-muted">@{profile.username}</p>
        {profile.bio && <p className="mt-3 max-w-xl text-sm">{profile.bio}</p>}
        {profile.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm text-accent hover:underline"
          >
            {profile.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </header>

      <section className="mt-12">
        <h2 className="mb-6 text-xl font-semibold">Visuals ({assets.length})</h2>
        <AssetGrid
          assets={assets}
          emptyMessage="No approved visuals yet."
        />
      </section>
    </div>
  );
}
