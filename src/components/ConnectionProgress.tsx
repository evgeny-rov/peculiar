const ConnectionProgress = ({ info, sessionId }: { info: string; sessionId: string | null }) => {
  console.log(window.location);
  console.log(sessionId);

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

export default ConnectionProgress;
