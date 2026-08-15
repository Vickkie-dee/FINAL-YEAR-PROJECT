import { useState } from 'react';
import Dashboard from './components/Dashboard';
import RepositoryTable from './components/RepositoryTable';
import UploadView from './components/UploadView';
import SingleEntryView from './components/SingleEntryView';
import ValidationRunner from './components/ValidationRunner';

const TABS = [
  { key: 'repository', label: 'Repository' },
  { key: 'dashboard', label: 'Dashboard' },
];

function LogoMark() {
  return (
    <img
      src="/logo.png"
      alt="Electronic Mail Repository"
      className="w-8 h-8 object-contain"
    />
  );
}

function App() {
  const [view, setView] = useState('repository');
  const [menuOpen, setMenuOpen] = useState(false);

  const selectTab = (key) => {
    setView(key);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header style={{ background: 'var(--ink)' }} className="text-white">
        <div className="px-4 md:px-6 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-mono-tech text-[10px] md:text-[11px] tracking-[0.15em] uppercase text-white/50">
               Vi-Validation System
              </p>
              <h1 className="text-base md:text-lg font-semibold mt-0.5 leading-none">
                Electronic Mail Repository
              </h1>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        <nav className="hidden md:flex gap-1 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => selectTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                view === tab.key
                  ? 'border-white text-white'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {menuOpen && (
          <nav className="md:hidden flex flex-col border-t border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => selectTab(tab.key)}
                className={`text-left px-4 py-3 text-sm font-medium ${
                  view === tab.key ? 'text-white bg-white/10' : 'text-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main>
        {view === 'repository' && <RepositoryTable />}
        {view === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

export default App;