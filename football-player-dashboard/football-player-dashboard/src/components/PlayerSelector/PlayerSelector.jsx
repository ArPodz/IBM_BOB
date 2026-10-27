import React from 'react';
import { Select, SelectItem } from '@carbon/react';

/**
 * Dropdown that lets the user pick a player by name.
 *
 * @param {{ players: import('../../utils/teamGenerator').Player[], selectedPlayer: string, onPlayerChange: (name: string) => void }} props
 */
function PlayerSelector({ players, selectedPlayer, onPlayerChange }) {
  return (
    <Select
      id="player-selector"
      labelText="Select a player"
      value={selectedPlayer}
      onChange={(e) => onPlayerChange(e.target.value)}
    >
      <SelectItem value="" text="-- Choose a player --" />
      {players.map((player) => (
        <SelectItem key={player.name} value={player.name} text={player.name} />
      ))}
    </Select>
  );
}

export default PlayerSelector;
