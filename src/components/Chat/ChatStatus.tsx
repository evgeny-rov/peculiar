import { useState } from 'react';
import VisualizedHash from '../VisualizedHash';

const ChatStatus = ({
  info,
  isConnected,
  sessionHash,
}: {
  info: string;
  isConnected: boolean;
  sessionHash: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header
      className="chat__status"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <div className="chat__status-info">
        <span className={isConnected ? 'status-light' : 'status-light status-light_inactive'} />
        {!isHovered && <span className="txt-system txt-system_dimmed">{info}</span>}
      </div>
      {isHovered && <span className="chat__status-fp-text">{sessionHash}</span>}
      {!isHovered && (
        <VisualizedHash data={sessionHash} height={'1rem'} strokeWidth={2} color="#fff" />
      )}
    </header>
  );
};

export default ChatStatus;
