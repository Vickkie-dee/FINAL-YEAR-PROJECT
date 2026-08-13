import { useState } from 'react';
import { uploadCsv } from '../api';

export default function UploadView() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const data = await uploadCsv(file);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Upload CSV</h1>
      <p className="text-sm text-gray-500 mb-4">
        CSV must have a column named <code className="bg-gray-100 px-1 rounded">email</code>.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
          <p className="font-medium text-green-800">Upload complete</p>
          <p className="text-sm text-green-700 mt-1">
            Total rows: {result.totalRows} · Imported: {result.imported} · Skipped (duplicates): {result.skipped}
          </p>
        </div>
      )}
    </div>
  );
}