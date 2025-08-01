import { IComment } from "@/models/Comment";
import { ILike } from "@/models/Like";
import { IReplies } from "@/models/Replies";
import { IVideo } from "@/models/Video";

export type VideoFormData = Omit<IVideo, "_id">;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
};

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api/${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async getVideos() {
    return this.fetch<IVideo[]>("/videos");
  }

  async editVideo(
    id: string,
    videoData: { title: string; description: string }
  ) {
    return this.fetch<IVideo>(`/videos/${id}`, {
      method: "PATCH",
      body: videoData,
    });
  }

  async getAVideo(id: string) {
    return this.fetch<IVideo>(`/videos/${id}`);
  }

  async deleteVideo(id: string) {
    return this.fetch<IVideo>(`/videos/${id}`, {
      method: "DELETE",
    });
  }

  async createVideo(videoData: VideoFormData) {
    return this.fetch<IVideo>("/videos", {
      method: "POST",
      body: videoData,
    });
  }

  async getComments(id: string) {
    return this.fetch<{ comments: IComment[] }>(`/videos/${id}/comments`);
  }

  async postComment(video_id: string, comment: string) {
    return this.fetch<{ comments: IComment }>(`/videos/${video_id}/comments`, {
      method: "POST",
      body: { comment },
    });
  }

  async searchVideos(query: string) {
    return this.fetch<IVideo[]>(`/videos?q=${encodeURIComponent(query)}`);
  }
  //encoded string is included in the URL, it ensures that the special characters ( , &) are treated as part of the query string and not as URL delimiters.

  async deleteComment(id: string) {
    return this.fetch<IComment>(`/comments/${id}`, {
      method: "DELETE",
    });
  }

  async editComment(id: string, comment: string) {
    console.log(id, comment, "id and comment in editComment");
    return this.fetch<IComment>(`/comments/${id}`, {
      method: "PATCH",
      body: { comment }, // Send as JSON object with key "comment"
    });
  }

  // Reply
  async post_reply(id: string, reply: string) {
    console.log(id, reply);
    return this.fetch<IReplies>(`/replies/${id}`, {
      method: "POST",
      body: { reply },
    });
  }

  async get_replies(id: string) {
    return this.fetch<{ replies: IReplies[] }>(`/replies/${id}`, {
      method: "GET",
    });
  }
  // LikepostLike
  async postLike(id: string) {
    console.log("id for like", id);
    return this.fetch(`/like/${id}`, {
      method: "POST",
    });
  }

  async fetchLikesForVideo(id: string) {
    console.log(id, "video id");
    return this.fetch(`/like/${id}`, {
      method: "GET",
    });
  }

  // Subscription
  async toggleFollow(id: string) {
    console.log(id, "id for toggle follow");
    return this.fetch(`/subscription/${id}`, {
      method: "POST",
    });
  }
  async fetchSubscriber(id: string) {
    console.log(id, "id to fetch subscriber");
    return this.fetch(`/subscription/${id}`, {
      method: "GET",
    });
  }
}

export const apiClient = new ApiClient();
