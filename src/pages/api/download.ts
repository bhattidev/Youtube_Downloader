import type { NextApiRequest, NextApiResponse } from 'next';

interface AudioFormat {
  format_id: string;
  ext: string;
  quality: string;
  size: string;
}

interface VideoInfo {
  title: string;
  formats: AudioFormat[];
}

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = 'youtube-mp36.p.rapidapi.com';

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

      // Extract video ID from URL
      const videoId = extractVideoId(url);
      if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }

      // Get video info from RapidAPI
      const response = await fetch(
        `https://${RAPID_API_HOST}/url?url=${encodeURIComponent(url)}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPID_API_KEY || '',
            'X-RapidAPI-Host': RAPID_API_HOST
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch video info');
      }

      const data = await response.json();
      
      // Format the response
      const formats = [
        {
          format_id: 'mp3_128',
          ext: 'mp3',
          quality: '128kbps',
          size: '~5MB'
        },
        {
          format_id: 'mp3_192',
          ext: 'mp3',
          quality: '192kbps',
          size: '~7MB'
        },
        {
          format_id: 'mp3_320',
          ext: 'mp3',
          quality: '320kbps',
          size: '~10MB'
        }
      ];

      res.status(200).json({
        title: data.title,
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

      // Get download link from RapidAPI
      const response = await fetch(
        `https://${RAPID_API_HOST}/url?url=${encodeURIComponent(url as string)}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPID_API_KEY || '',
            'X-RapidAPI-Host': RAPID_API_HOST
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get download link');
      }

      const data = await response.json();

      // Redirect to the download URL
      res.redirect(data.link);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Failed to download audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
} 