'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Asset {
  id: string
  title: string
  storage_path: string
  uploader_id: string
  profiles: any
}

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('id, title, storage_path, uploader_id')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching assets:', error)
    } else {
      // For now, set profiles as null since join is causing issues
      const assetsWithProfiles = (data || []).map(asset => ({
        ...asset,
        profiles: null
      }))
      setAssets(assetsWithProfiles)
    }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Visuals for Africa, by Africa
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Discover and download royalty-free photos and videos showcasing the beauty and diversity of Africa.
            </p>
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search for African visuals..."
                  className="flex-1 px-4 py-2 rounded-l-md text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-gray-800 px-6 py-2 rounded-r-md hover:bg-gray-700"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Trending Assets</h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : assets.length === 0 ? (
          <div className="text-center text-gray-500">
            No assets available yet. Be the first to upload!
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="break-inside-avoid mb-4">
                <Link href={`/asset/${asset.id}`}>
                  <div className="relative group cursor-pointer">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${asset.storage_path}`}
                      alt={asset.title}
                      className="w-full h-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-end">
                      <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold">{asset.title}</h3>
                        <p className="text-sm">by {asset.profiles?.username || 'Unknown'}</p>
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
  )
}
