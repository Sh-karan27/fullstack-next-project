import { apiClient } from '@/lib/api-client';
import { IVideo } from '@/models/Video';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [videos, setvideos] = useState<IVideo[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await apiClient.getVideos();
        setvideos(data);
      } catch (error) {
        console.error('Error fetching videos');
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <h1>Chai code</h1>
    </div>
  );
}
