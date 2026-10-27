import React from 'react';
import { Select, SelectItem } from '@carbon/react';
import './FormationBoard.scss';

/**
 * The four most popular formations in professional football.
 * Rows are ordered from attack → defence (top → bottom on the pitch).
 */
export const FORMATIONS = {
  '4-3-3': [
    { label: 'FWD', count: 3 },
    { label: 'MID', count: 3 },
    { label: 'DEF', count: 4 },
    { label: 'GK',  count: 1 },
  ],
  '4-4-2': [
    { label: 'FWD', count: 2 },
    { label: 'MID', count: 4 },
    { label: 'DEF', count: 4 },
    { label: 'GK',  count: 1 },
  ],
  '4-2-3-1': [
    { label: 'FWD', count: 1 },
    { label: 'AMF', count: 3 },
    { label: 'DMF', count: 2 },
    { label: 'DEF', count: 4 },
    { label: 'GK',  count: 1 },
  ],
  '3-5-2': [
    { label: 'FWD', count: 2 },
    { label: 'MID', count: 5 },
    { label: 'DEF', count: 3 },
    { label: 'GK',  count: 1 },
  ],
};

/**
 * Avatar tile for a single player slot on the pitch.
 */
function PlayerToken({ player, isSelected, onSelect }) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`formation-token formation-token--clickable${isSelected ? ' formation-token--selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(player)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(player)}
    >
      <div className="formation-token__avatar">
        {player.photo && !imgError ? (
          <img
            src={player.photo}
            alt={player.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="formation-token__avatar-fallback">?</span>
        )}
      </div>
      <span className="formation-token__name">{player.name}</span>
    </div>
  );
}

/**
 * Empty placeholder shown when a slot has no assigned player.
 */
function EmptyToken({ label }) {
  return (
    <div className="formation-token formation-token--empty" aria-label={`Empty ${label} slot`}>
      <div className="formation-token__avatar formation-token__avatar--empty" />
      <span className="formation-token__name">—</span>
    </div>
  );
}

/**
 * Visual football-pitch formation board.
 *
 * Accepts up to 11 players, a controlled formation string, and callbacks
 * for formation changes and player selection.
 *
 * @param {{
 *   players: import('../../utils/teamGenerator').Player[],
 *   formation: string,
 *   onFormationChange: (formation: string) => void,
 *   selectedPlayer: object|null,
 *   onPlayerSelect: (player: object) => void,
 * }} props
 */
function FormationBoard({ players, formation, onFormationChange, selectedPlayer, onPlayerSelect }) {
  const rows = FORMATIONS[formation];

  // Assign players to rows sequentially (attack first, keeper last)
  let cursor = 0;
  const assignedRows = rows.map((row) => {
    const slice = players.slice(cursor, cursor + row.count);
    cursor += row.count;
    return { ...row, players: slice };
  });

  const isEmpty = players.length === 0;

  return (
    <div className="formation-board" role="region" aria-label="Formation board">
      <div className="formation-board__controls">
        <Select
          id="formation-select"
          labelText="Formation"
          value={formation}
          onChange={(e) => onFormationChange(e.target.value)}
          size="sm"
        >
          {Object.keys(FORMATIONS).map((f) => (
            <SelectItem key={f} value={f} text={f} />
          ))}
        </Select>
      </div>

      <div className="formation-board__pitch">
        {isEmpty ? (
          <p className="formation-board__empty-msg">
            Click <strong>Generate Dream Team</strong> to populate the formation.
          </p>
        ) : (
          assignedRows.map((row) => (
            <div key={row.label} className="formation-board__row">
              <span className="formation-board__row-label">{row.label}</span>
              <div className="formation-board__row-players">
                {Array.from({ length: row.count }).map((_, i) =>
                  row.players[i] ? (
                    <PlayerToken
                      key={row.players[i].name}
                      player={row.players[i]}
                      isSelected={selectedPlayer?.name === row.players[i].name}
                      onSelect={onPlayerSelect}
                    />
                  ) : (
                    <EmptyToken key={i} label={row.label} />
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FormationBoard;
