'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Asset {
  id: string
  title: string
  description: string
  storage_path: string
  uploader_id: string
  profiles: any
}

export default function AdminPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== 'patrickudo2004@outlook.com') { // Admin email
        router.push('/')
        return
      }
      setUser(user)
      fetchPendingAssets()
    }
    getUser()
  }, [router])

  const fetchPendingAssets = async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*, profiles(username)')
      .eq('approved', false)

    if (error) {
      console.error(error)
    } else {
      setAssets(data || [])
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('assets')
      .update({ approved: true })
      .eq('id', id)

    if (error) {
      alert('Error approving asset')
    } else {
      setAssets(assets.filter(asset => asset.id !== id))
    }
  }

  const handleReject = async (id: string, storagePath: string) => {
    // Delete from storage
    await supabase.storage.from('assets').remove([storagePath])

    // Delete from DB
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error rejecting asset')
    } else {
      setAssets(assets.filter(asset => asset.id !== id))
    }
  }

  if (!user) {
    return <div className="text-center py-12">Access denied</div>
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <p className="mb-6">Pending uploads: {assets.length}</p>

        {assets.length === 0 ? (
          <div className="text-center text-gray-500">
            No pending assets.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white rounded-lg shadow-md p-4">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${asset.storage_path}`}
                  alt={asset.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="font-semibold mb-2">{asset.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
                <p className="text-sm text-gray-500 mb-4">by {asset.profiles?.username || 'Unknown'}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(asset.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(asset.id, asset.storage_path)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}