const ChatLoading = ({ info, sessionId }: { info: string; sessionId: string | null }) => {
  return (
    <div className="loading">
      <div>
        <span className="caret">{'>_'}</span>
        <span className="txt-system txt-system_nonselectible">{info}</span>
      </div>
      {sessionId && <span className="txt-system">{`${window.location.origin}/${sessionId}`}</span>}
    </div>
  );
};

export default ChatLoading;
