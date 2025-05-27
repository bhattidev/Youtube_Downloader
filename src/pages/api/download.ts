import type { NextApiRequest, NextApiResponse } from 'next';
import youtubeDl from 'youtube-dl-exec';
import { sanitizeFilename } from '@/utils/sanitize';

interface AudioFormat {
  format_id: string;
  ext: string;
  acodec: string;
  vcodec: string;
  abr?: number; // Audio bitrate
  filesize?: number;
  format_note?: string;
}

interface VideoInfo {
  title: string;
  formats: AudioFormat[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Get video info
      const info = await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        callHome: false,
      }) as VideoInfo;

      // Filter for audio-only formats and sort by quality
      const formats = info.formats
        .filter(format => format.acodec !== 'none' && format.vcodec === 'none')
        .map(format => ({
          itag: format.format_id,
          quality: format.abr ? `${format.abr}kbps` : format.format_note || 'Unknown',
          mimeType: format.ext,
          size: format.filesize ? `${(format.filesize / 1024 / 1024).toFixed(1)}MB` : 'Unknown',
          container: format.ext,
        }))
        .sort((a, b) => {
          const aBitrate = parseInt(a.quality) || 0;
          const bBitrate = parseInt(b.quality) || 0;
          return bBitrate - aBitrate;
        });

      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        title: info.title,
        formats,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Failed to process video',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'GET') {
    try {
      const { url, itag } = req.query;

      if (!url || !itag) {
        return res.status(400).json({ error: 'URL and itag are required' });
      }

      // Get video info first to get the title
      const info = await youtubeDl(url as string, {
        dumpSingleJson: true,
        noWarnings: true,
        callHome: false,
      }) as VideoInfo;

      // Set response headers
      res.setHeader('Content-Type', 'audio/mpeg');
      const safeTitle = sanitizeFilename(info.title);
      const filename = encodeURIComponent(safeTitle);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}.mp3`);

      // Download the audio
      const audio = await youtubeDl(url as string, {
        format: itag as string,
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0, // Best quality
        output: '-', // Output to stdout
        noWarnings: true,
        callHome: false,
      });

      // Send the audio data
      res.send(audio);
    } catch (error) {
      console.error('Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to download audio',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 