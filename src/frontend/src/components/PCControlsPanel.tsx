import { useState } from 'react';
import {
  Volume2, VolumeX, Sun, SunDim, ChevronUp, ChevronDown,
  ExternalLink, Search, Info
} from 'lucide-react';
import { usePCControls } from '../hooks/usePCControls';
import SearchResultPanel from './SearchResultPanel';

interface ControlBtnProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  colorClass?: string;
}

function ControlBtn({ onClick, icon, label, colorClass = 'text-cyan-jarvis' }: ControlBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded border border-jarvis-cyan/20 hover:border-jarvis-cyan/50 hover:bg-jarvis-cyan/5 transition-all ${colorClass}`}
      title={label}
    >
      {icon}
      <span className="text-[10px] opacity-70">{label}</span>
    </button>
  );
}

function CapabilityBadge({ label, isOs }: { label: string; isOs: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${
        isOs
          ? 'bg-green-900/40 text-green-400 border border-green-700/40'
          : 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/40'
      }`}
      title={
        isOs
          ? 'Opens in your OS browser'
          : 'App-level only — browsers cannot control system volume/brightness'
      }
    >
      <Info size={9} />
      {label}
    </span>
  );
}

export default function PCControlsPanel() {
  const {
    volume,
    brightness,
    urlToOpen,
    setUrlToOpen,
    wikiQuery,
    setWikiQuery,
    searchResult,
    clearSearchResult,
    volumeUp,
    volumeDown,
    brightnessUp,
    brightnessDown,
    scrollUp,
    scrollDown,
    openUrl,
    searchWikipedia,
  } = usePCControls();

  const [localUrl, setLocalUrl] = useState(urlToOpen);
  const [localQuery, setLocalQuery] = useState(wikiQuery);

  return (
    <div className="space-y-3 p-3">
      {/* Info banner */}
      <div className="flex items-start gap-2 p-2 rounded bg-yellow-900/20 border border-yellow-700/30 text-yellow-400 text-[10px] leading-relaxed">
        <Info size={11} className="mt-0.5 shrink-0" />
        <span>
          Browser controls affect this app only. Use voice commands like{' '}
          <strong>"open YouTube"</strong> to launch sites in your OS browser.
        </span>
      </div>

      {/* Volume */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Volume2 size={12} className="text-cyan-jarvis" />
            <span className="text-[10px] text-cyan-jarvis font-mono tracking-wider">VOLUME</span>
          </div>
          <CapabilityBadge label="App Only" isOs={false} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-jarvis-cyan/10 rounded-full overflow-hidden border border-jarvis-cyan/20">
            <div
              className="h-full bg-jarvis-cyan/60 rounded-full transition-all"
              style={{ width: `${volume}%` }}
            />
          </div>
          <span className="text-[10px] text-cyan-jarvis/70 font-mono w-7 text-right">{volume}%</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <ControlBtn onClick={volumeUp} icon={<Volume2 size={14} />} label="VOL +" />
          <ControlBtn onClick={volumeDown} icon={<VolumeX size={14} />} label="VOL -" />
        </div>
      </div>

      {/* Brightness */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sun size={12} className="text-cyan-jarvis" />
            <span className="text-[10px] text-cyan-jarvis font-mono tracking-wider">BRIGHTNESS</span>
          </div>
          <CapabilityBadge label="App Only" isOs={false} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-jarvis-cyan/10 rounded-full overflow-hidden border border-jarvis-cyan/20">
            <div
              className="h-full bg-yellow-400/60 rounded-full transition-all"
              style={{ width: `${brightness}%` }}
            />
          </div>
          <span className="text-[10px] text-cyan-jarvis/70 font-mono w-7 text-right">{brightness}%</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <ControlBtn onClick={brightnessUp} icon={<Sun size={14} />} label="BRT +" colorClass="text-yellow-400" />
          <ControlBtn onClick={brightnessDown} icon={<SunDim size={14} />} label="BRT -" colorClass="text-yellow-400" />
        </div>
      </div>

      {/* Scroll */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-cyan-jarvis font-mono tracking-wider">SCROLL</span>
        <div className="grid grid-cols-2 gap-1.5">
          <ControlBtn onClick={scrollUp} icon={<ChevronUp size={14} />} label="UP" />
          <ControlBtn onClick={scrollDown} icon={<ChevronDown size={14} />} label="DOWN" />
        </div>
      </div>

      {/* Open URL */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ExternalLink size={12} className="text-cyan-jarvis" />
            <span className="text-[10px] text-cyan-jarvis font-mono tracking-wider">OPEN URL</span>
          </div>
          <CapabilityBadge label="OS Browser" isOs={true} />
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={localUrl}
            onChange={e => setLocalUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && localUrl.trim()) {
                openUrl(localUrl.trim());
                setLocalUrl('');
                setUrlToOpen('');
              }
            }}
            placeholder="youtube.com or full URL"
            className="flex-1 bg-jarvis-bg border border-jarvis-cyan/30 rounded px-2 py-1 text-[11px] text-cyan-jarvis placeholder-jarvis-cyan/30 focus:outline-none focus:border-jarvis-cyan/60"
          />
          <button
            onClick={() => { if (localUrl.trim()) { openUrl(localUrl.trim()); setLocalUrl(''); } }}
            className="px-2 py-1 bg-jarvis-cyan/10 border border-jarvis-cyan/30 rounded text-cyan-jarvis text-[11px] hover:bg-jarvis-cyan/20 transition-colors"
          >
            Open
          </button>
        </div>
      </div>

      {/* Wikipedia Search */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Search size={12} className="text-cyan-jarvis" />
          <span className="text-[10px] text-cyan-jarvis font-mono tracking-wider">WIKIPEDIA</span>
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={localQuery}
            onChange={e => setLocalQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && localQuery.trim()) {
                searchWikipedia(localQuery.trim());
                setLocalQuery('');
                setWikiQuery('');
              }
            }}
            placeholder="Search topic..."
            className="flex-1 bg-jarvis-bg border border-jarvis-cyan/30 rounded px-2 py-1 text-[11px] text-cyan-jarvis placeholder-jarvis-cyan/30 focus:outline-none focus:border-jarvis-cyan/60"
          />
          <button
            onClick={() => { if (localQuery.trim()) { searchWikipedia(localQuery.trim()); setLocalQuery(''); } }}
            className="px-2 py-1 bg-jarvis-cyan/10 border border-jarvis-cyan/30 rounded text-cyan-jarvis text-[11px] hover:bg-jarvis-cyan/20 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {searchResult && (
        <SearchResultPanel result={searchResult} onClose={clearSearchResult} />
      )}
    </div>
  );
}
