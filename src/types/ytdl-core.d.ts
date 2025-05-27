declare module 'ytdl-core' {
  export interface VideoFormat {
    itag: number;
    url: string;
    mimeType: string;
    bitrate: number;
    width: number;
    height: number;
    lastModified: string;
    contentLength: string;
    quality: string;
    qualityLabel: string;
    projectionType: string;
    averageBitrate: number;
    audioQuality: string;
    approxDurationMs: string;
    audioSampleRate: string;
    audioChannels: number;
    hasAudio: boolean;
    hasVideo: boolean;
    container: string;
  }

  export interface VideoDetails {
    videoId: string;
    title: string;
    lengthSeconds: string;
    keywords: string[];
    channelId: string;
    isOwnerViewing: boolean;
    shortDescription: string;
    isCrawlable: boolean;
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }[];
    averageRating: number;
    allowRatings: boolean;
    viewCount: string;
    author: {
      id: string;
      name: string;
      user: string;
      channel_url: string;
      external_channel_url: string;
      user_url: string;
      subscriber_count: number;
    };
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    isLiveContent: boolean;
  }

  export interface VideoInfo {
    formats: VideoFormat[];
    videoDetails: VideoDetails;
  }

  export function getInfo(url: string): Promise<VideoInfo>;
  export function chooseFormat(formats: VideoFormat[], options: { quality?: string }): VideoFormat;
  export function validateURL(url: string): boolean;
  export default function ytdl(url: string, options?: { format?: VideoFormat }): NodeJS.ReadableStream;
} 