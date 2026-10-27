import React, { useState } from 'react';
import { Tag } from '@carbon/react';
import './PlayerCard.scss';

const POSITION_COLORS = {
  Goalkeeper: 'yellow',
  Defender:   'blue',
  Midfielder: 'green',
  Attacker:   'red',
};

/**
 * Displays a photo card for the selected player.
 *
 * @param {{ player: import('../../utils/teamGenerator').Player }} props
 */
function PlayerCard({ player }) {
  const [imgError, setImgError] = useState(false);
  const tagColor = POSITION_COLORS[player.position] || 'gray';

  return (
    <div className="player-card">
      <div className="player-card__photo-wrapper">
        {player.photo && !imgError ? (
          <img
            className="player-card__photo"
            src={player.photo}
            alt={player.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="player-card__photo-placeholder" aria-label="No photo available">
            <span>?</span>
          </div>
        )}
      </div>

      <div className="player-card__info">
        <h2 className="player-card__name">{player.name}</h2>
        {player.position && (
          <Tag className="player-card__position" type={tagColor} size="sm">
            {player.position}
          </Tag>
        )}
        <p className="player-card__club">{player.club}</p>
      </div>
    </div>
  );
}

export default PlayerCard;
