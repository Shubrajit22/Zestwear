'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function UploadsAdmin() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/uploads/list');
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files);
      } else {
        toast.error(data.message || 'Failed to load files');
      }
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) return;

    setDeleting(filename);
    try {
      const res = await fetch('/api/admin/uploads/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('File deleted successfully');
        setFiles(files.filter(f => f !== filename));
      } else {
        toast.error(data.message || 'Failed to delete file');
      }
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Filter files by search term (case-insensitive)
  const filteredFiles = files.filter((file) =>
    file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center py-10">Loading uploaded files...</p>;

  if (files.length === 0) return <p className="text-center py-10">No uploaded files found.</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto mt-30">
      <h1 className="text-3xl font-bold mb-6 text-center">Uploaded Files Management</h1>

      {/* Search input */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <p className="text-center py-10">No files match your search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file} className="border rounded shadow p-2 flex flex-col items-center gap-3">
              <div className="w-full h-32 relative">
                <Image
                  src={`/uploads/${file}`}
                  alt={file}
                  fill
                  sizes="(max-width: 768px) 100vw, 200px"
                  className="object-contain rounded"
                />
              </div>
              <p className="text-xs truncate max-w-full">{file}</p>
              <button
                disabled={deleting === file}
                onClick={() => handleDelete(file)}
                className={`px-3 py-1 rounded text-white cursor-pointer ${
                  deleting === file ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting === file ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
