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
    color: '#9848cc', textColor: '#fff',
    teams: [
      { name: 'Cape Verde',  flag: '🇨🇻', odds: '+33000' },
      { name: 'Curaçao',     flag: '🇨🇼', odds: '+33000' },
      { name: 'Haiti',       flag: '🇭🇹', odds: '+33000' },
      { name: 'Jordan',      flag: '🇯🇴', odds: '+33000' },
      { name: 'New Zealand', flag: '🇳🇿', odds: '+33000' },
      { name: 'Panama',      flag: '🇵🇦', odds: '+33000' },
      { name: 'Qatar',       flag: '🇶🇦', odds: '+33000' },
      { name: 'Uzbekistan',  flag: '🇺🇿', odds: '+33000' },
    ],
  },
]

// All team names flat for lookup
const ALL_TEAMS = POTS.flatMap(p => p.teams)
function teamInfo(name) {
  return ALL_TEAMS.find(t => t.name === name) || { name, flag: '🏳️', odds: '' }
}
function potForTeam(name) {
  return POTS.find(p => p.teams.some(t => t.name === name))
}

// Payout structure — totals exactly $800
const ROUNDS = [
  { key: 'r32',    label: 'Round of 32',   short: 'R32',   payout: 3,   color: '#888780', bg: '#F1EFE8', text: '#5F5E5A' },
  { key: 'r16',    label: 'Round of 16',   short: 'R16',   payout: 6,   color: '#378ADD', bg: '#E6F1FB', text: '#185FA5' },
  { key: 'qf',     label: 'Quarterfinals', short: 'QF',    payout: 12,  color: '#1D9E75', bg: '#E1F5EE', text: '#0F6E56' },
  { key: 'sf',     label: 'Semifinals',    short: 'SF',    payout: 25,  color: '#BA7517', bg: '#FAEEDA', text: '#854F0B' },
  { key: 'final',  label: 'Final',         short: 'Final', payout: 56,  color: '#7F77DD', bg: '#EEEDFE', text: '#534AB7' },
  { key: 'winner', label: 'Winner',        short: 'Champ', payout: 300, color: '#D85A30', bg: '#FAECE7', text: '#993C1D' },
]

function emptyPicks() {
  return Array.from({ length: 6 }, () => new Array(8).fill(null))
}
// results[teamName] = { r32: bool, r16: bool, qf: bool, sf: bool, final: bool, winner: bool }
function emptyResults() { return {} }

function takenInPot(picks, potIdx) {
  return new Set(picks[potIdx].filter(Boolean))
}
function assignRandom(picks, potIdx, playerIdx) {
  const taken = takenInPot(picks, potIdx)
  const available = POTS[potIdx].teams.filter(t => !taken.has(t.name))
  if (!available.length) return null
  return available[Math.floor(Math.random() * available.length)].name
}

// Earnings for a player given their picks and results
function calcEarnings(playerIdx, picks, results) {
  let total = 0
  const breakdown = []
  POTS.forEach((pot, potIdx) => {
    const teamName = picks[potIdx]?.[playerIdx]
    if (!teamName) return
    const teamResults = results[teamName] || {}
    const team = teamInfo(teamName)
    let teamTotal = 0
    ROUNDS.forEach(r => {
      if (teamResults[r.key]) teamTotal += r.payout
    })
    if (teamTotal > 0) breakdown.push({ teamName, team, teamTotal, teamResults })
    total += teamTotal
  })
  return { total, breakdown }
}

const SPIN_FLAGS = ['🇫🇷','🇧🇷','🇩🇪','🇦🇷','🇯🇵','🇲🇽','🇵🇹','🇺🇸','🇰🇷','🇳🇱','🇨🇴','🇸🇳']
const gold = '#D4A843'

export default function App() {
  const [page, setPage]             = useState('home')
  const [activeName, setActiveName] = useState(null)
  const [picks, setPicks]           = useState(emptyPicks())
  const [results, setResults]       = useState(emptyResults())
  const [ready, setReady]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [spinning, setSpinning]     = useState({})
  const [spinFrame, setSpinFrame]   = useState({})
  const [revealAll, setRevealAll]   = useState(false)
  const [error, setError]           = useState(null)
  const [pendingName, setPendingName] = useState(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const COMMISSIONER_PASSWORD = 'Addie'

  function handleNameClick(name) {
    if (name === COMMISSIONER) {
      setPendingName(name)
      setPasswordInput('')
      setPasswordError(false)
    } else {
      setActiveName(name)
    }
  }

  function handlePasswordSubmit() {
    if (passwordInput === COMMISSIONER_PASSWORD) {
      setActiveName(pendingName)
      setPendingName(null)
      setPasswordInput('')
      setPasswordError(false)
    } else {
      setPasswordError(true)
      setPasswordInput('')
    }
  }

  const isCommissioner = activeName === COMMISSIONER
  const allAssigned = picks.every(pp => pp.every(v => v !== null))

  useEffect(() => {
    loadPicks().then(s => {
      if (s?.picks) setPicks(s.picks)
      if (s?.results) setResults(s.results)
      setReady(true)
    }).catch(() => {
      setError('Could not connect to database. Check your internet connection.')
      setReady(true)
    })
    const unsub = subscribePicks(s => {
      if (s?.picks) setPicks(s.picks)
      if (s?.results) setResults(s.results)
    })
    return () => unsub()
  }, [])

  async function persist(newPicks, newResults) {
    setSaving(true)
    try { await savePicks({ picks: newPicks, results: newResults }) }
} catch (e) { setError('Failed to save: ' + e.message) }
    finally { setSaving(false) }
  }

  function handleGetCountry(potIdx) {
    if (!activeName) return
    const pi = NAMES.indexOf(activeName)
    if (picks[potIdx][pi] || spinning[potIdx]) return
    const teamName = assignRandom(picks, potIdx, pi)
    if (!teamName) return
    setSpinning(prev => ({ ...prev, [potIdx]: true }))
    let frame = 0
    const interval = setInterval(() => {
      setSpinFrame(prev => ({ ...prev, [potIdx]: SPIN_FLAGS[frame % SPIN_FLAGS.length] }))
      frame++
    }, 80)
    setTimeout(() => {
      clearInterval(interval)
      setSpinning(prev => ({ ...prev, [potIdx]: false }))
      setSpinFrame(prev => ({ ...prev, [potIdx]: null }))
      const np = picks.map((pp, ppi) => ppi === potIdx ? pp.map((v, i) => i === pi ? teamName : v) : pp)
      setPicks(np)
      persist(np, results)
    }, 900)
  }

  function handleUndoPick(potIdx, playerIdx) {
    if (!isCommissioner) return
    const np = picks.map((pp, ppi) => ppi === potIdx ? pp.map((v, i) => i === playerIdx ? null : v) : pp)
    setPicks(np)
    persist(np, results)
  }

  function handleResetAll() {
    if (!isCommissioner) return
    if (!window.confirm('Reset all picks for everyone? This cannot be undone.')) return
    const np = emptyPicks()
    const nr = emptyResults()
    setPicks(np); setResults(nr)
    persist(np, nr)
  }

  function handleToggleResult(teamName, roundKey) {
    if (!isCommissioner) return
    const nr = {
      ...results,
      [teamName]: { ...(results[teamName] || {}), [roundKey]: !(results[teamName]?.[roundKey]) }
    }
    setResults(nr)
    persist(picks, nr)
  }

  // Leaderboard sorted by earnings
  const leaderboard = NAMES.map((name, pi) => ({
    name,
    pi,
    ...calcEarnings(pi, picks, results),
  })).sort((a, b) => b.total - a.total)

  if (!ready) return (
    <div style={{ background: '#0C1017', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontFamily: 'Georgia,serif', fontSize: 16 }}>
      Loading…
    </div>
  )

  return (
    <div style={{ fontFamily: "'Georgia',serif", background: 'linear-gradient(135deg,#0C1017 0%,#0d1b2a 100%)', minHeight: '100vh', color: '#e8dcc8' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(180deg,#1a1200,#0C1017)', borderBottom: `3px solid ${gold}`, padding: '22px 20px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.28em', color: gold, opacity: 0.65, textTransform: 'uppercase', marginBottom: 5 }}>
          2026 FIFA World Cup · 8-Person Pool
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(20px,5vw,38px)', fontWeight: 700, letterSpacing: '0.05em', color: '#fff', textShadow: '0 0 40px rgba(212,168,67,0.35)' }}>
          ⚽ <span style={{ color: '#F0C96A' }}>World Cup</span> Pool 2026
        </h1>
        <div style={{ fontSize: 12, color: 'rgba(212,168,67,0.5)', marginTop: 5, fontStyle: 'italic' }}>
          Log in · hit Get a Country · let fate decide
        </div>
        <div style={{ marginTop: 6, fontSize: 11, height: 16, color: saving ? gold : 'transparent', transition: 'color 0.3s' }}>
          {saving ? '⏳ Saving…' : '✓'}
        </div>
      </div>

      {/* NAV */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, padding: '12px 14px', borderBottom: '1px solid rgba(212,168,67,0.18)', flexWrap: 'wrap' }}>
        {[['home','🙋 My Picks'],['pots','🗂 The Pots'],['scores','💰 Scoreboard'],['payouts','📋 Payouts'],['results','🏆 Results']].map(([v, lbl]) => (
          <button key={v} onClick={() => setPage(v)} style={{
            padding: '6px 14px', borderRadius: 18, border: '1px solid',
            borderColor: page === v ? gold : 'rgba(212,168,67,0.28)',
            background: page === v ? 'rgba(212,168,67,0.14)' : 'transparent',
            color: page === v ? gold : '#9a8a6a',
            cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia,serif',
          }}>{lbl}</button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(192,64,64,0.15)', border: '1px solid rgba(192,64,64,0.4)', borderRadius: 8, margin: '14px auto', maxWidth: 600, padding: '10px 16px', textAlign: 'center', fontSize: 13, color: '#e08080' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '22px 14px 70px' }}>

        {/* ══════════ HOME ══════════ */}
        {page === 'home' && (
          <div>
            {!activeName ? (
              <div>
                <p style={{ textAlign: 'center', color: '#9a8a6a', fontSize: 14, marginBottom: 22 }}>Who are you?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {NAMES.map(name => {
                    const pi = NAMES.indexOf(name)
                    const done = picks.every(pp => pp[pi] !== null)
                    const earnings = calcEarnings(pi, picks, results).total
                    return (
                      <button key={name} onClick={() => handleNameClick(name)} style={{
                        padding: '12px 22px', borderRadius: 22,
                        border: `2px solid ${done ? 'rgba(74,154,74,0.6)' : 'rgba(212,168,67,0.35)'}`,
                        background: 'rgba(255,255,255,0.03)',
                        color: done ? '#4a9a4a' : '#e8dcc8',
                        cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 600,
                      }}>
                        {done ? '✓ ' : ''}{name}{name === COMMISSIONER ? ' 🔑' : ''}
                        {earnings > 0 && <span style={{ display: 'block', fontSize: 12, color: '#4a9a4a', fontWeight: 400, marginTop: 2 }}>${earnings} earned</span>}
                      </button>
                    )
                  })}
                </div>

                {/* Password modal */}
                {pendingName && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
                    onClick={() => { setPendingName(null); setPasswordError(false) }}>
                    <div style={{ background: '#141B26', border: `2px solid ${gold}`, borderRadius: 14, padding: '28px 24px', maxWidth: 340, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', textAlign: 'center' }}
                      onClick={e => e.stopPropagation()}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>🔑</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#e8dcc8', marginBottom: 6 }}>Commissioner Access</div>
                      <div style={{ fontSize: 13, color: '#9a8a6a', marginBottom: 20 }}>Enter the password to log in as Tucker</div>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
                        onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                        autoFocus
                        placeholder="Password"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8, border: `1px solid ${passwordError ? '#c06060' : 'rgba(212,168,67,0.4)'}`, background: '#0C1017', color: '#e8dcc8', fontSize: 15, fontFamily: 'Georgia,serif', marginBottom: 8, outline: 'none' }}
                      />
                      {passwordError && (
                        <div style={{ fontSize: 12, color: '#c06060', marginBottom: 10 }}>Incorrect password. Try again.</div>
                      )}
                      <button onClick={handlePasswordSubmit} style={{ width: '100%', padding: '10px', borderRadius: 10, background: `linear-gradient(135deg,${gold},#F0C96A)`, color: '#1a0e00', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'Georgia,serif', marginTop: 4 }}>
                        Unlock
                      </button>
                      <button onClick={() => { setPendingName(null); setPasswordError(false) }} style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#6a5a4a', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 13 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#e8dcc8' }}>{isCommissioner ? '🔑 ' : ''}{activeName}</div>
                    <div style={{ fontSize: 12, color: '#9a8a6a', marginTop: 2 }}>
                      {picks.filter(pp => pp[NAMES.indexOf(activeName)] !== null).length} / 6 countries assigned
                      {calcEarnings(NAMES.indexOf(activeName), picks, results).total > 0 &&
                        <span style={{ color: '#4a9a4a', marginLeft: 10 }}>· ${calcEarnings(NAMES.indexOf(activeName), picks, results).total} earned so far</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {isCommissioner && (
                      <button onClick={() => setRevealAll(r => !r)} style={{ padding: '6px 12px', borderRadius: 14, border: `1px solid ${revealAll ? gold : 'rgba(212,168,67,0.3)'}`, background: revealAll ? 'rgba(212,168,67,0.15)' : 'transparent', color: revealAll ? gold : '#9a8a6a', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12 }}>
                        {revealAll ? '👁 Showing all' : '👁 Show all'}
                      </button>
                    )}
                    {isCommissioner && (
                      <button onClick={handleResetAll} style={{ padding: '6px 12px', borderRadius: 14, border: '1px solid rgba(192,64,64,0.5)', background: 'rgba(192,64,64,0.1)', color: '#c06060', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12 }}>Reset pool</button>
                    )}
                    <button onClick={() => setActiveName(null)} style={{ padding: '6px 12px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#9a8a6a', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12 }}>Switch</button>
                  </div>
                </div>

                {POTS.map((pot, potIdx) => {
                  const pi = NAMES.indexOf(activeName)
                  const myTeamName = picks[potIdx][pi]
                  const myTeam = myTeamName ? pot.teams.find(t => t.name === myTeamName) : null
                  const myEarnings = myTeamName ? ROUNDS.filter(r => results[myTeamName]?.[r.key]).reduce((s, r) => s + r.payout, 0) : 0
                  const isSpinning = spinning[potIdx]
                  const assignedCount = picks[potIdx].filter(Boolean).length

                  return (
                    <div key={potIdx} style={{ marginBottom: 12, background: 'rgba(255,255,255,0.025)', border: `1px solid ${myTeam ? 'rgba(74,154,74,0.45)' : isSpinning ? pot.color : `${pot.color}44`}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.3s' }}>
                      <div style={{ background: `${pot.color}18`, borderBottom: `2px solid ${myTeam ? 'rgba(74,154,74,0.5)' : isSpinning ? pot.color : `${pot.color}55`}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: myTeam ? '#2a7a2a' : pot.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: myTeam ? '#fff' : pot.textColor, flexShrink: 0 }}>
                            {myTeam ? '✓' : pot.number}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: myTeam ? '#4a9a4a' : pot.color }}>{pot.label}</div>
                            <div style={{ fontSize: 11, color: '#6a5a4a' }}>{pot.sublabel}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#6a5a4a' }}>{assignedCount}/8 assigned</div>
                      </div>

                      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', minHeight: 64 }}>
                        <div style={{ flex: 1 }}>
                          {isSpinning ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 32 }}>{spinFrame[potIdx]}</span>
                              <span style={{ fontSize: 13, color: '#9a8a6a', fontStyle: 'italic' }}>Drawing…</span>
                            </div>
                          ) : myTeam ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 30 }}>{myTeam.flag}</span>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 18, color: '#e8dcc8' }}>{myTeam.name}</div>
                                <div style={{ fontSize: 12, color: pot.color, fontFamily: 'monospace' }}>{myTeam.odds} to win</div>
                                {myEarnings > 0 && <div style={{ fontSize: 12, color: '#4a9a4a', marginTop: 2 }}>${myEarnings} earned</div>}
                                {/* Round badges */}
                                {myTeamName && (
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
                                    {ROUNDS.map(r => (
                                      <span key={r.key} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: results[myTeamName]?.[r.key] ? r.bg : 'rgba(255,255,255,0.05)', color: results[myTeamName]?.[r.key] ? r.text : '#555', border: `1px solid ${results[myTeamName]?.[r.key] ? r.color + '66' : 'rgba(255,255,255,0.07)'}` }}>
                                        {r.short}{results[myTeamName]?.[r.key] ? ` +$${r.payout}` : ''}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: '#555', fontSize: 13, fontStyle: 'italic' }}>Not yet assigned</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {!myTeam && !isSpinning && (
                            <button onClick={() => handleGetCountry(potIdx)} disabled={assignedCount >= 8} style={{ padding: '10px 18px', borderRadius: 20, background: assignedCount >= 8 ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg,${pot.color},${pot.color}cc)`, color: assignedCount >= 8 ? '#555' : pot.textColor, fontWeight: 700, fontSize: 14, border: 'none', cursor: assignedCount >= 8 ? 'not-allowed' : 'pointer', fontFamily: 'Georgia,serif', whiteSpace: 'nowrap' }}>
                              {assignedCount >= 8 ? 'Pot full' : '🎲 Get a Country'}
                            </button>
                          )}
                          {myTeam && isCommissioner && (
                            <button onClick={() => handleUndoPick(potIdx, NAMES.indexOf(activeName))} style={{ padding: '5px 10px', borderRadius: 12, border: '1px solid rgba(192,64,64,0.4)', background: 'rgba(192,64,64,0.08)', color: '#c06060', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12 }}>Undo</button>
                          )}
                        </div>
                      </div>

                      {isCommissioner && revealAll && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 16px 10px' }}>
                          <div style={{ fontSize: 11, color: '#6a5a4a', marginBottom: 6 }}>All picks this pot:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {NAMES.map((n, npi) => {
                              const t = picks[potIdx][npi] ? pot.teams.find(tm => tm.name === picks[potIdx][npi]) : null
                              return (
                                <div key={n} style={{ padding: '4px 10px', borderRadius: 8, background: t ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${t ? `${pot.color}44` : 'rgba(255,255,255,0.06)'}`, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ color: '#9a8a6a' }}>{n}:</span>
                                  {t ? (
                                    <>
                                      <span style={{ color: '#e8dcc8' }}>{t.flag} {t.name}</span>
                                      <button onClick={() => handleUndoPick(potIdx, npi)} style={{ marginLeft: 2, padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(192,64,64,0.35)', background: 'rgba(192,64,64,0.08)', color: '#c06060', cursor: 'pointer', fontSize: 10, fontFamily: 'Georgia,serif' }}>✕</button>
                                    </>
                                  ) : <span style={{ color: '#444', fontStyle: 'italic' }}>–</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════ POTS ══════════ */}
        {page === 'pots' && (
          <div>
            <p style={{ textAlign: 'center', color: '#9a8a6a', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              All 48 qualified teams in 6 pots of 8, ranked by BetMGM championship odds (June 2026). Italy &amp; Denmark did not qualify.
            </p>
            {POTS.map(pot => (
              <div key={pot.number} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${pot.color}44`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ background: `${pot.color}20`, borderBottom: `2px solid ${pot.color}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: pot.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: pot.textColor, flexShrink: 0 }}>{pot.number}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: pot.color }}>{pot.label}</div>
                    <div style={{ fontSize: 11, color: '#9a8a6a' }}>{pot.sublabel}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))' }}>
                  {pot.teams.map(team => (
                    <div key={team.name} style={{ padding: '7px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13 }}>{team.flag} {team.name}</span>
                      <span style={{ fontSize: 11, color: pot.color, fontFamily: 'monospace' }}>{team.odds}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════ SCOREBOARD ══════════ */}
        {page === 'scores' && (
          <div>
            <p style={{ textAlign: 'center', color: '#9a8a6a', fontSize: 13, marginBottom: 20 }}>
              Live standings based on countries that have advanced. Updated by Tucker after each round.
            </p>
            {leaderboard.map((entry, rank) => (
              <div key={entry.name} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${rank === 0 && entry.total > 0 ? 'rgba(212,168,67,0.5)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ background: rank === 0 && entry.total > 0 ? 'rgba(212,168,67,0.1)' : 'rgba(255,255,255,0.02)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: rank === 0 && entry.total > 0 ? gold : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: rank === 0 && entry.total > 0 ? '#1a0e00' : '#9a8a6a', flexShrink: 0 }}>
                      {rank + 1}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#e8dcc8' }}>{entry.name}{entry.name === COMMISSIONER ? ' 🔑' : ''}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: entry.total > 0 ? '#4a9a4a' : '#555' }}>
                    {entry.total > 0 ? `$${entry.total}` : '—'}
                  </div>
                </div>
                {entry.breakdown.length > 0 && (
                  <div style={{ padding: '8px 16px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {entry.breakdown.map(({ teamName, team, teamTotal, teamResults }) => (
                      <div key={teamName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{team.flag}</span>
                          <span style={{ fontSize: 13, color: '#e8dcc8' }}>{teamName}</span>
                          <div style={{ display: 'flex', gap: 3 }}>
                            {ROUNDS.filter(r => teamResults[r.key]).map(r => (
                              <span key={r.key} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: r.bg, color: r.text }}>{r.short}</span>
                            ))}
                          </div>
                        </div>
                        <span style={{ fontSize: 13, color: '#4a9a4a', fontWeight: 700 }}>${teamTotal}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {leaderboard.every(e => e.total === 0) && (
              <div style={{ textAlign: 'center', color: '#555', fontSize: 13, fontStyle: 'italic', marginTop: 30 }}>
                No earnings yet — tournament starts June 11!
              </div>
            )}
          </div>
        )}

        {/* ══════════ PAYOUTS ══════════ */}
        {page === 'payouts' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ background: 'rgba(212,168,67,0.1)', borderBottom: '2px solid rgba(212,168,67,0.4)', padding: '12px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: gold }}>Payout Structure</div>
                <div style={{ fontSize: 12, color: '#9a8a6a', marginTop: 2 }}>$100 buy-in · $800 total pot · pays out exactly</div>
              </div>
              {ROUNDS.map((r, i) => {
                const teams = r.key === 'r32' ? 32 : r.key === 'r16' ? 16 : r.key === 'qf' ? 8 : r.key === 'sf' ? 4 : r.key === 'final' ? 2 : 1
                return (
                  <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < ROUNDS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: r.bg, color: r.text }}>{r.short}</span>
                      <span style={{ fontSize: 14, color: '#e8dcc8' }}>{r.label}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: r.color }}>${r.payout}</span>
                      <span style={{ fontSize: 11, color: '#6a5a4a', marginLeft: 6 }}>per country · ${r.payout * teams} round total</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Commissioner results entry */}
            {isCommissioner && allAssigned && (
              <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: 'rgba(212,168,67,0.08)', borderBottom: '1px solid rgba(212,168,67,0.2)', padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: gold }}>🔑 Enter Results</div>
                  <div style={{ fontSize: 12, color: '#9a8a6a', marginTop: 2 }}>Toggle rounds for each team as they advance. Earnings update instantly for everyone.</div>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {ALL_TEAMS.filter(team => {
                    // Only show teams that are assigned to someone
                    return POTS.some((pot, potIdx) => picks[potIdx].includes(team.name))
                  }).map(team => {
                    const pot = potForTeam(team.name)
                    return (
                      <div key={team.name} style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 130 }}>
                          <span style={{ fontSize: 18 }}>{team.flag}</span>
                          <span style={{ fontSize: 13, color: '#e8dcc8' }}>{team.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {ROUNDS.map(r => {
                            const active = results[team.name]?.[r.key]
                            return (
                              <button key={r.key} onClick={() => handleToggleResult(team.name, r.key)} style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid ${active ? r.color : 'rgba(255,255,255,0.1)'}`, background: active ? r.bg : 'rgba(255,255,255,0.03)', color: active ? r.text : '#666', cursor: 'pointer', fontSize: 11, fontWeight: active ? 700 : 400, fontFamily: 'Georgia,serif' }}>
                                {r.short}{active ? ` ✓` : ''}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {isCommissioner && !allAssigned && (
              <div style={{ textAlign: 'center', color: '#6a5a4a', fontSize: 13, fontStyle: 'italic', marginTop: 16 }}>
                Results entry unlocks once all 48 countries are assigned.
              </div>
            )}

            {!isCommissioner && (
              <div style={{ textAlign: 'center', color: '#6a5a4a', fontSize: 13, fontStyle: 'italic', marginTop: 16 }}>
                Results are entered by Tucker after each round.
              </div>
            )}
          </div>
        )}

        {/* ══════════ RESULTS ══════════ */}
        {page === 'results' && (
          <div>
            {!allAssigned && !isCommissioner && (
              <div style={{ background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: 10, padding: '20px', marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: gold, fontSize: 16, marginBottom: 6 }}>🔒 Results Hidden</div>
                <div style={{ fontSize: 13, color: '#9a8a6a', lineHeight: 1.6 }}>Everyone's countries will be revealed once all 48 are assigned.</div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#6a5a4a' }}>{picks.flat().filter(Boolean).length} / 48 countries assigned</div>
                <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 8, overflow: 'hidden', maxWidth: 300, margin: '8px auto 0' }}>
                  <div style={{ height: '100%', background: gold, width: `${(picks.flat().filter(Boolean).length / 48) * 100}%`, transition: 'width 0.4s', borderRadius: 4 }} />
                </div>
              </div>
            )}
            {(allAssigned || isCommissioner) && (
              <>
                {!allAssigned && isCommissioner && (
                  <div style={{ background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, textAlign: 'center', fontSize: 13, color: '#9a8a6a' }}>
                    🔑 Commissioner preview — {picks.flat().filter(Boolean).length}/48 assigned.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                  {NAMES.map((name, pi) => {
                    const doneCount = picks.filter(pp => pp[pi] !== null).length
                    const earnings = calcEarnings(pi, picks, results).total
                    return (
                      <div key={name} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${doneCount === 6 ? 'rgba(74,154,74,0.3)' : 'rgba(212,168,67,0.18)'}`, borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ background: doneCount === 6 ? 'rgba(74,154,74,0.1)' : 'rgba(212,168,67,0.1)', borderBottom: `1px solid ${doneCount === 6 ? 'rgba(74,154,74,0.25)' : 'rgba(212,168,67,0.2)'}`, padding: '9px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: '#e8dcc8' }}>{name}{name === COMMISSIONER ? ' 🔑' : ''}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: doneCount === 6 ? '#4a9a4a' : '#6a5a4a' }}>{doneCount}/6{doneCount === 6 ? ' ✓' : ''}</div>
                            {earnings > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: '#4a9a4a' }}>${earnings}</div>}
                          </div>
                        </div>
                        {POTS.map((pot, potIdx) => {
                          const teamName = picks[potIdx][pi]
                          const team = teamName ? pot.teams.find(t => t.name === teamName) : null
                          const teamEarnings = teamName ? ROUNDS.filter(r => results[teamName]?.[r.key]).reduce((s, r) => s + r.payout, 0) : 0
                          return (
                            <div key={potIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', borderBottom: potIdx < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: team ? pot.color : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: team ? pot.textColor : '#444', flexShrink: 0 }}>{pot.number}</div>
                                {team ? <span style={{ fontSize: 13 }}>{team.flag} {team.name}</span> : <span style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>not yet assigned</span>}
                              </div>
                              {teamEarnings > 0 && <span style={{ fontSize: 12, color: '#4a9a4a', fontWeight: 700 }}>${teamEarnings}</span>}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
