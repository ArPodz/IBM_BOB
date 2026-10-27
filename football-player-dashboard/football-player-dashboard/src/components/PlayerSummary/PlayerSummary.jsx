import React from 'react';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import './PlayerSummary.scss';

/**
 * Tabular breakdown of a player's key statistics.
 *
 * @param {{ player: import('../../utils/teamGenerator').Player }} props
 */
function PlayerSummary({ player }) {
  const rows = [
    { label: 'Age',         value: player.age ?? '—' },
    { label: 'Nationality', value: player.citizenship ?? '—' },
    { label: 'Height',      value: player.height != null ? `${player.height} cm` : '—' },
    { label: 'Club',        value: player.club ?? '—' },
    { label: 'Position',    value: player.position ?? '—' },
    { label: 'Rating',      value: player.rating != null ? player.rating.toFixed(2) : '—' },
  ];

  return (
    <div className="player-summary">
    <StructuredListWrapper aria-label={`${player.name} statistics`}>
      <StructuredListHead>
        <StructuredListRow head>
          <StructuredListCell head>Stat</StructuredListCell>
          <StructuredListCell head>Value</StructuredListCell>
        </StructuredListRow>
      </StructuredListHead>
      <StructuredListBody>
        {rows.map(({ label, value }) => (
          <StructuredListRow key={label}>
            <StructuredListCell>{label}</StructuredListCell>
            <StructuredListCell>{value}</StructuredListCell>
          </StructuredListRow>
        ))}
      </StructuredListBody>
    </StructuredListWrapper>
    </div>
  );
}

export default PlayerSummary;
