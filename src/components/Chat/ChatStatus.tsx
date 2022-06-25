const ChatStatus = ({
  info,
  isConnected,
  fingerprint,
}: {
  info: string;
  isConnected: boolean;
  fingerprint: string;
}) => {
  return (
    <header className="chat__status">
      <div className="chat__status-info">
        <span className={isConnected ? 'status-light' : 'status-light status-light_inactive'} />
        <span className="txt-system txt-system_dimmed">{info}</span>
      </div>

      {fingerprint && <span className="txt-system txt-system_dimmed">SF: {fingerprint}</span>}
    </header>
  );
};

export default ChatStatus;
