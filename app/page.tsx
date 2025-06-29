"use client";
import { apiClient } from "@/lib/api-client";
import { IVideo } from "@/models/Video";

import { useEffect, useState } from "react";
import VideoFeed from "./components/VideoFeed";

export default function Home() {
  const [videos, setvideos] = useState<IVideo[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await apiClient.getVideos();
        setvideos(data);
      } catch (error) {
        console.error("Error fetching videos");
      }
    };

    fetchVideos();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ImageKit ReelsPro</h1>
      <VideoFeed videos={videos} />
    </main>
  );
}
