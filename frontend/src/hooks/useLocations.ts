import { useState, useEffect } from 'react'
import { getNearestLocations } from '@/lib/getLocations'
import { LocationWithThumbnailAndDistance } from '@/app/types/location'

export const useLocations = (nearestCount: number = 3) => {
  const [userLocation, setUserLocation] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null })

  // ユーザの位置情報を監視
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null  = null

    // ユーザの位置情報を取得する処理
    const updateUserLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      )
    }

    const startInterval = () => {
      intervalId = setInterval(updateUserLocation, 10000)
    }

    // ページが非表示になった時に位置情報の取得を停止
    const handleVisibilityChange = () => {
      if (document.hidden && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      } else {
        startInterval()
      }
    }

    // handleVisibilityChangeをイベントリスナーとして登録
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // アクセスした時にユーザの位置情報を取得
    updateUserLocation()
    // 10秒おきにユーザの位置情報を取得
    startInterval()

    return () => {
      if (intervalId) clearInterval(intervalId)
      // handleVisibilityChangeをイベントリスナーとして登録したので、解除
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // 最寄りの場所を取得
  const fetchNearestLocations = async (): Promise<LocationWithThumbnailAndDistance[]> => {
    if (userLocation.lat !== null && userLocation.lon !== null) {
      try {
        const fetchedNearestLocations = await getNearestLocations(userLocation.lat, userLocation.lon, nearestCount)
        return fetchedNearestLocations
      } catch (error) {
        console.error('Failed to fetch nearest locations:', error)
        return []
      }
    }
    return []
  }

  return { userLocation, fetchNearestLocations }
}