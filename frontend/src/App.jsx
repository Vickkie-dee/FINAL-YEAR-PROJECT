import { useState } from 'react';
import Dashboard from './components/Dashboard';
import RepositoryTable from './components/RepositoryTable';
import UploadView from './components/UploadView';
import SingleEntryView from './components/SingleEntryView';

function App() {
  const [view, setView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex gap-4 p-4 border-b bg-gray-50">
        <button onClick={() => setView('dashboard')} className={`px-3 py-1 rounded ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Dashboard</button>
        <button onClick={() => setView('repository')} className={`px-3 py-1 rounded ${view === 'repository' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Repository</button>
        <button onClick={() => setView('upload')} className={`px-3 py-1 rounded ${view === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Upload</button>
        <button onClick={() => setView('singleEntry')} className={`px-3 py-1 rounded ${view === 'singleEntry' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Add Email</button>
      </nav>

      {view === 'dashboard' && <Dashboard />}
      {view === 'repository' && <RepositoryTable />}
      {view === 'upload' && <UploadView />}
      {view === 'singleEntry' && <SingleEntryView />}
    </div>
  );
}

export default App;