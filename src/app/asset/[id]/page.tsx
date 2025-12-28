'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useParams } from 'next/navigation'

interface Asset {
  id: string
  title: string
  description: string
  tags: string[]
  category: string
  storage_path: string
  uploader_id: string
  downloads: number
  profiles: any
}

export default function AssetDetailPage() {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    fetchAsset()
  }, [id])

  const fetchAsset = async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*, profiles(username)')
      .eq('id', id)
      .eq('approved', true)
      .single()

    if (error) {
      console.error(error)
    } else {
      setAsset(data)
    }
    setLoading(false)
  }

  const handleDownload = async (size: 'original' | 'medium' = 'original') => {
    if (!asset) return

    // Get download URL
    const { data } = supabase.storage
      .from('assets')
      .getPublicUrl(asset.storage_path)

    // Open download in new tab
    window.open(data.publicUrl, '_blank')

    // Increment download count
    await supabase
      .from('assets')
      .update({ downloads: asset.downloads + 1 })
      .eq('id', id)
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!asset) {
    return <div className="text-center py-12">Asset not found</div>
  }

  const isVideo = asset.storage_path.toLowerCase().includes('.mp4') || asset.storage_path.toLowerCase().includes('.mov')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asset Display */}
          <div>
            {isVideo ? (
              <video
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${asset.storage_path}`}
                controls
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${asset.storage_path}`}
                alt={asset.title}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* Metadata and Actions */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{asset.title}</h1>
            <p className="text-gray-600 mb-4">by {asset.profiles?.username || 'Unknown'}</p>
            {asset.description && (
              <p className="text-gray-700 mb-4">{asset.description}</p>
            )}
            <div className="mb-4">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                {asset.category}
              </span>
              {asset.tags.map((tag, index) => (
                <span key={index} className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">{asset.downloads} downloads</p>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => handleDownload('original')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Download Original
              </button>
              {!isVideo && (
                <button
                  onClick={() => handleDownload('medium')}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Download Medium (Web)
                </button>
              )}
            </div>

            {/* Attribution Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Attribution:</strong> We encourage you to credit the creator when using this asset.
                Example: "Photo by {asset.profiles?.username || 'Creator'} on Pisure"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}