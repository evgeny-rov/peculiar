const ChatStatus = ({
  info,
  isClosed,
  fingerprint,
}: {
  info: string;
  isClosed: boolean;
  fingerprint: string | null;
}) => {
  return (
    <header className="chat__status">
      <div className="chat__status-info">
        <span className={`status-light${isClosed ? ' status-light_inactive' : ''}`} />
        <span className="txt-system txt-system_size_sm">{info}</span>
      </div>

      {!isClosed && fingerprint && (
        <span className="txt-system txt-system_size_sm">SF: {fingerprint}</span>
      )}
    </header>
  );
};

export default ChatStatus;
