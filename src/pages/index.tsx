import { useState } from 'react';
import Head from 'next/head';

interface AudioFormat {
  format_id: string;
  ext: string;
  quality: string;
  size: string;
}

interface AudioInfo {
  title: string;
  formats: AudioFormat[];
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAudioInfo(null);

    try {
      console.log('Submitting URL:', url);
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch audio info');
      }

      setAudioInfo(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (formatId: string) => {
    try {
      setDownloading(formatId);
      setError('');

      console.log('Downloading format:', formatId);
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}&itag=${formatId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.details || 'Failed to download audio');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'audio.mp3';

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download audio');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
      <Head>
        <title>YouTube Audio Downloader</title>
        <meta name="description" content="Download audio from YouTube videos" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full max-w-4xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-youtube-red to-red-400 bg-clip-text text-transparent">
          YouTube Audio Downloader
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex gap-4 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-youtube-red transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-youtube-red text-white font-semibold hover:bg-youtube-red-hover transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Get Audio Info'}
          </button>
        </form>

        {error && (
          <div className="w-full max-w-2xl mx-auto p-4 mb-8 text-red-400 bg-red-900/20 rounded-lg text-center">
            {error}
          </div>
        )}

        {audioInfo && (
          <div className="w-full bg-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">{audioInfo.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audioInfo.formats.map((format) => (
                <div key={format.format_id} className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <p className="text-gray-300">Quality: {format.quality}</p>
                  <p className="text-gray-300">Size: {format.size}</p>
                  <p className="text-gray-300">Format: {format.ext.toUpperCase()}</p>
                  <button
                    onClick={() => handleDownload(format.format_id)}
                    disabled={downloading === format.format_id}
                    className="w-full mt-4 px-4 py-2 bg-youtube-red text-white text-center rounded hover:bg-youtube-red-hover transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {downloading === format.format_id ? 'Downloading...' : 'Download MP3'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
