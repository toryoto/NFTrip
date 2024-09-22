import { useState, useEffect } from "react";
import { getLocations, getNearestLocations } from "@/lib/getLocations";
import { Location, LocationWithThumbnailAndDistance } from "@/app/types/location";

export const useLocations = (nearestCount: number = 3) => {
  const [userLocation, setUserLocation] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null })
  const [locations, setLocations] = useState<(Location & { thumbnail: string | null })[]>([]);
  const [nearestLocations, setNearestLocations] = useState<LocationWithThumbnailAndDistance[]>([]);
  const [distances, setDistances] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // ユーザの位置情報を監視
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null  = null;

    // ユーザの位置情報を取得する処理
    const updateUserLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    };

    const startInterval = () => {
      intervalId = setInterval(updateUserLocation, 10000);
    };

    // ページが非表示になった時に位置情報の取得を停止
    const handleVisibilityChange = () => {
      if (document.hidden && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      } else {
        startInterval();
      }
    };

    // handleVisibilityChangeをイベントリスナーとして登録
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // アクセスした時にユーザの位置情報を取得
    updateUserLocation();
    // 10秒おきにユーザの位置情報を取得
    startInterval();

    return () => {
      if (intervalId) clearInterval(intervalId);
      // handleVisibilityChangeをイベントリスナーとして登録したので、解除
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []);

  // 全ての観光地を取得
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const fetchedLocations = await getLocations();
        setLocations(fetchedLocations);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // 最寄りの場所を取得
  useEffect(() => {
    const fetchNearestLocations = async () => {
      if (userLocation.lat !== null && userLocation.lon !== null) {
        setLoading(true);
        try {
          const fetchedNearestLocations = await getNearestLocations(userLocation.lat, userLocation.lon, nearestCount);
          setNearestLocations(fetchedNearestLocations);
        } catch (error) {
          console.error('Failed to fetch nearest locations:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchNearestLocations();
  }, [userLocation.lat, userLocation.lon, nearestCount]);

  useEffect(() => {
    if (userLocation.lat !== null && userLocation.lon !== null) {
      const newDistances: { [key: number]: number } = {}
      locations.forEach(location => {
        const distance = calculateDistance(userLocation.lat!, userLocation.lon!, location.latitude, location.longitude)
        newDistances[location.id] = distance
      })
      setDistances(newDistances)
    }
  }, [userLocation, locations])


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return Number(distance.toFixed(1))
  }

  return { userLocation, locations, nearestLocations, loading, distances };
}