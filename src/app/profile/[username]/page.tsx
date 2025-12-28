'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'

interface Profile {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string
  website: string
}

interface Asset {
  id: string
  title: string
  storage_path: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const username = params.username as string

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    // First get profile by username
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (profileError) {
      console.error(profileError)
      setLoading(false)
      return
    }

    setProfile(profileData)

    // Then get approved assets
    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select('id, title, storage_path')
      .eq('uploader_id', profileData.id)
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (assetsError) {
      console.error(assetsError)
    } else {
      setAssets(assetsData || [])
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="text-center mb-12">
          {profile.avatar_url && (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={100}
              height={100}
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
          )}
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          <p className="text-gray-600">@{profile.username}</p>
          {profile.bio && <p className="mt-4 text-gray-700">{profile.bio}</p>}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500"
            >
              {profile.website}
            </a>
          )}
        </div>

        {/* Assets Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Uploaded Assets ({assets.length})</h2>
          {assets.length === 0 ? (
            <div className="text-center text-gray-500">
              No approved assets yet.
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="break-inside-avoid mb-4">
                  <Link href={`/asset/${asset.id}`}>
                    <div className="relative group cursor-pointer">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${asset.storage_path}`}
                        alt={asset.title}
                        width={300}
                        height={200}
                        className="w-full h-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <h3 className="font-semibold">{asset.title}</h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}