'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Asset {
  id: string
  title: string
  storage_path: string
  uploader_id: string
  profiles: any
}

export default function SearchPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && query) {
      searchAssets(query)
    } else if (mounted) {
      setLoading(false)
    }
  }, [query, mounted])

  const searchAssets = async (searchQuery: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('id, title, storage_path, uploader_id')
      .eq('approved', true)
      .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}},category.ilike.%${searchQuery}%`)

    if (error) {
      console.error('Error searching assets:', error)
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>
          {query && <p className="text-gray-600">Showing results for "{query}"</p>}
        </div>

        {loading ? (
          <div className="text-center">Searching...</div>
        ) : assets.length === 0 ? (
          <div className="text-center text-gray-500">
            No assets found for "{query}". Try different keywords.
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