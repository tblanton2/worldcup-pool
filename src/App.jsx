import { useState, useEffect } from 'react'
import { loadPicks, savePicks, subscribePicks } from './firebase.js'

const NAMES = ['Tucker', 'Burns', 'Chabal', 'Tex', 'Jack', 'Seabass', 'Z', 'Jason']
const COMMISSIONER = 'Tucker'

const POTS = [
  {
    number: 1, label: 'Pot 1 — Favorites', sublabel: 'Top championship contenders',
    color: '#D4A843', textColor: '#1a0e00',
    teams: [
      { name: 'France',      flag: '🇫🇷', odds: '+450'  },
      { name: 'Spain',       flag: '🇪🇸', odds: '+500'  },
      { name: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', odds: '+650'  },
      { name: 'Brazil',      flag: '🇧🇷', odds: '+800'  },
      { name: 'Argentina',   flag: '🇦🇷', odds: '+800'  },
      { name: 'Portugal',    flag: '🇵🇹', odds: '+900'  },
      { name: 'Germany',     flag: '🇩🇪', odds: '+1400' },
      { name: 'Netherlands', flag: '🇳🇱', odds: '+2000' },
    ],
  },
  {
    number: 2, label: 'Pot 2 — Contenders', sublabel: 'Dark horse title threats',
    color: '#B8B8B8', textColor: '#111',
    teams: [
      { name: 'Norway',   flag: '🇳🇴', odds: '+3500' },
      { name: 'Belgium',  flag: '🇧🇪', odds: '+4000' },
      { name: 'Colombia', flag: '🇨🇴', odds: '+4000' },
      { name: 'Morocco',  flag: '🇲🇦', odds: '+4000' },
      { name: 'USA',      flag: '🇺🇸', odds: '+4000' },
      { name: 'Uruguay',  flag: '🇺🇾', odds: '+5000' },
      { name: 'Croatia',  flag: '🇭🇷', odds: '+5000' },
      { name: 'Mexico',   flag: '🇲🇽', odds: '+5000' },
    ],
  },
  {
    number: 3, label: 'Pot 3 — Challengers', sublabel: 'Capable of a deep run',
    color: '#C87840', textColor: '#fff',
    teams: [
      { name: 'Ecuador',     flag: '🇪🇨', odds: '+6600'  },
      { name: 'Senegal',     flag: '🇸🇳', odds: '+6600'  },
      { name: 'Switzerland', flag: '🇨🇭', odds: '+6600'  },
      { name: 'Türkiye',     flag: '🇹🇷', odds: '+8000'  },
      { name: 'Japan',       flag: '🇯🇵', odds: '+8000'  },
      { name: 'Sweden',      flag: '🇸🇪', odds: '+10000' },
      { name: 'Serbia',      flag: '🇷🇸', odds: '+10000' },
      { name: 'South Korea', flag: '🇰🇷', odds: '+10000' },
    ],
  },
  {
    number: 4, label: 'Pot 4 — Sleepers', sublabel: 'Potential upset artists',
    color: '#3aaa6b', textColor: '#fff',
    teams: [
      { name: 'Austria',      flag: '🇦🇹', odds: '+12500' },
      { name: 'Australia',    flag: '🇦🇺', odds: '+15000' },
      { name: 'Czechia',      flag: '🇨🇿', odds: '+15000' },
      { name: 'Egypt',        flag: '🇪🇬', odds: '+15000' },
      { name: 'Bosnia-Herz.', flag: '🇧🇦', odds: '+15000' },
      { name: 'Ivory Coast',  flag: '🇨🇮', odds: '+20000' },
      { name: 'Scotland',     flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', odds: '+20000' },
      { name: 'Iran',         flag: '🇮🇷', odds: '+20000' },
    ],
  },
  {
    number: 5, label: 'Pot 5 — Long Shots', sublabel: 'Making up the numbers (or are they?)',
    color: '#4888d8', textColor: '#fff',
    teams: [
      { name: 'Algeria',      flag: '🇩🇿', odds: '+25000' },
      { name: 'Canada',       flag: '🇨🇦', odds: '+25000' },
      { name: 'Ghana',        flag: '🇬🇭', odds: '+25000' },
      { name: 'Paraguay',     flag: '🇵🇾', odds: '+25000' },
      { name: 'South Africa', flag: '🇿🇦', odds: '+25000' },
      { name: 'Tunisia',      flag: '🇹🇳', odds: '+25000' },
      { name: 'DR Congo',     flag: '🇨🇩', odds: '+30000' },
      { name: 'Iraq',         flag: '🇮🇶', odds: '+30000' },
    ],
  },
  {
    number: 6, label: 'Pot 6 — Wildcards', sublabel: 'Every tournament needs a Cinderella',
    color: '#9848cc
