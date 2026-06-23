'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Cake, User, ChevronDown } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const LANG_FLAGS: Record<string, string> = {
  'Japanese': '🇯🇵',
  'English': '🇺🇸',
  'Spanish (Latin America)': '🇲🇽',
};

interface VoiceActorData {
  id: string;
  name: string;
  language: string;
  profileUrl?: string | null;
  agency?: string | null;
}

interface BirthdayCardProps {
  name: string;
  series: string;
  birthday: string; // "MM-DD"
  description?: string | null;
  imageUrl?: string | null;
  voiceActors?: VoiceActorData[];
}

export default function BirthdayCard({
  name,
  series,
  birthday,
  description,
  imageUrl,
  voiceActors = [],
}: BirthdayCardProps) {
  const [vaOpen, setVaOpen] = useState(false);
  const [mm, dd] = birthday.split('-').map(Number);
  const formattedDate = `${MONTH_NAMES[(mm || 1) - 1]} ${dd || '?'}`;

  return (
    <div className="rounded-xl overflow-hidden bg-void-light border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]">
      {/* Character image / placeholder */}
      <div className="relative aspect-square" style={{ backgroundColor: '#0d0f1a' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} from ${series}`}
            fill
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <User className="w-16 h-16" style={{ color: '#3BF0FF' }} strokeWidth={1.5} />
            <span className="text-[11px] font-medium tracking-wide text-center px-4 truncate max-w-full" style={{ color: '#3BF0FF', opacity: 0.6 }}>
              {series}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-void-light via-transparent to-transparent" />
        {/* Birthday badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-neon-magenta/20 backdrop-blur-sm border border-neon-magenta/30">
          <Cake className="w-3 h-3 text-neon-magenta" />
          <span className="text-neon-magenta text-[10px] font-bold tracking-wider">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
        <p className="text-gray-400 text-xs truncate mt-0.5">{series}</p>
        {description && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{description}</p>
        )}

        {/* Voice Actors toggle */}
        {voiceActors.length > 0 && (
          <>
            <button
              onClick={() => setVaOpen((v) => !v)}
              className="mt-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 hover:opacity-80"
              style={{ color: '#FF3BD9' }}
            >
              Voice Actors
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${vaOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: vaOpen ? `${voiceActors.length * 32 + 8}px` : '0px',
                opacity: vaOpen ? 1 : 0,
              }}
            >
              <div className="pt-2 space-y-1.5">
                {voiceActors.map((va) => {
                  const flag = LANG_FLAGS[va.language] || '🌐';
                  return (
                    <div key={va.id} className="flex items-center gap-1.5 text-xs">
                      <span className="flex-shrink-0">{flag}</span>
                      {va.profileUrl ? (
                        <a
                          href={va.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-neon-cyan transition-colors truncate"
                        >
                          {va.name}
                        </a>
                      ) : (
                        <span className="text-gray-400 truncate">{va.name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
