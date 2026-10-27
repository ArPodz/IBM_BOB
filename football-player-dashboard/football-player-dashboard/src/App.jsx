import React, { useState } from 'react';
import {
  Theme,
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  SkipToContent,
  Content,
  Button,
} from '@carbon/react';
import PlayerSelector from './components/PlayerSelector/PlayerSelector';
import PlayerCard from './components/PlayerCard/PlayerCard';
import PlayerSummary from './components/PlayerSummary/PlayerSummary';
import FormationBoard from './components/FormationBoard/FormationBoard';
import { generateTeamByFormation } from './utils/teamGenerator';
import { FORMATIONS } from './components/FormationBoard/FormationBoard';
import players from './data/players.json';
import './App.scss';

const PAGES = {
  BROWSER:   'browser',
  FORMATION: 'formation',
};

function App() {
  const [page, setPage]                       = useState(PAGES.BROWSER);
  const [selectedPlayer, setSelectedPlayer]   = useState('');
  const [formation, setFormation]             = useState('4-3-3');
  const [teamPlayers, setTeamPlayers]         = useState([]);
  const [formationPlayer, setFormationPlayer] = useState(null);

  const playerData = players.find((p) => p.name === selectedPlayer) || null;

  function handleNav(e, target) {
    e.preventDefault();
    setPage(target);
  }

  function handleGenerateTeam() {
    setFormationPlayer(null);
    setTeamPlayers(generateTeamByFormation(players, FORMATIONS[formation]));
  }

  function handleFormationChange(newFormation) {
    setFormation(newFormation);
    setFormationPlayer(null);
    // If a team is already on the board, regenerate it for the new formation
    if (teamPlayers.length > 0) {
      setTeamPlayers(generateTeamByFormation(players, FORMATIONS[newFormation]));
    }
  }

  return (
    <>
      <Theme theme="g90">
        <Header aria-label="Player Dashboard">
          <SkipToContent />
          <HeaderName href="#" prefix="">
            Player Dashboard
          </HeaderName>
          <HeaderNavigation aria-label="Main navigation">
            <HeaderMenuItem
              href="#"
              isCurrentPage={page === PAGES.BROWSER}
              aria-current={page === PAGES.BROWSER ? 'page' : undefined}
              onClick={(e) => handleNav(e, PAGES.BROWSER)}
            >
              Player Browser
            </HeaderMenuItem>
            <HeaderMenuItem
              href="#"
              isCurrentPage={page === PAGES.FORMATION}
              aria-current={page === PAGES.FORMATION ? 'page' : undefined}
              onClick={(e) => handleNav(e, PAGES.FORMATION)}
            >
              Team Formation
            </HeaderMenuItem>
          </HeaderNavigation>
        </Header>
      </Theme>

      <Content className="app-content">

        {/* ── Player Browser page ── */}
        {page === PAGES.BROWSER && (
          <div className="page-browser">
            <div className="page-browser__left">
              <div className="player-selector-wrapper">
                <PlayerSelector
                  players={players}
                  selectedPlayer={selectedPlayer}
                  onPlayerChange={setSelectedPlayer}
                />
              </div>
              {playerData && <PlayerCard player={playerData} />}
            </div>
            {playerData && (
              <div className="page-browser__right">
                <PlayerSummary player={playerData} />
              </div>
            )}
          </div>
        )}

        {/* ── Team Formation page ── */}
        {page === PAGES.FORMATION && (
          <div className="page-formation">
            <div className="page-formation__topbar">
              <div className="page-formation__titles">
                <h2 className="page-formation__heading">Team Formation Visualizer</h2>
                <p className="page-formation__subheading">
                  Select a formation, then generate your dream team.
                </p>
              </div>
              <Button kind="primary" onClick={handleGenerateTeam}>
                Generate Dream Team
              </Button>
            </div>
            <div className="page-formation__layout">
              <div className="page-formation__board">
                <FormationBoard
                  players={teamPlayers}
                  formation={formation}
                  onFormationChange={handleFormationChange}
                  selectedPlayer={formationPlayer}
                  onPlayerSelect={setFormationPlayer}
                />
              </div>
              {formationPlayer && (
                <div className="page-formation__detail-panel">
                  <h3 className="page-formation__detail-heading">{formationPlayer.name}</h3>
                  <PlayerCard player={formationPlayer} />
                  <PlayerSummary player={formationPlayer} />
                </div>
              )}
            </div>
          </div>
        )}

      </Content>
    </>
  );
}

export default App;
