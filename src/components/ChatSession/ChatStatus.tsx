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
        <span className={isClosed ? 'status-light status-light_inactive' : 'status-light'} />
        <span className="txt-system txt-system_dimmed">{info}</span>
      </div>

      {!isClosed && fingerprint && (
        <span className="txt-system txt-system_dimmed">SF: {fingerprint}</span>
      )}
    </header>
  );
};

export default ChatStatus;
