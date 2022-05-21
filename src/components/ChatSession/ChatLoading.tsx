const ChatLoading = ({ info, sessionId }: { info: string; sessionId: string | null }) => {
  return (
    <>
      <div>
        <span className="caret">{'>_'}</span>
        <span className="status-info">{info}</span>
      </div>
      {sessionId && <p>{`${window.location.origin}/${sessionId}`}</p>}
    </>
  );
};

export default ChatLoading;
