const CreatedStep = ({ sessionId, info }: { sessionId: string; info: string }) => {
  return (
    <div className="wrapper">
      <div>
        <span className="caret">{'>_'}</span>
        <span className="txt-system txt-system_nonselectible">{info}</span>
      </div>
      {sessionId && <span className="txt-system">{`${window.location.origin}/${sessionId}`}</span>}
    </div>
  );
};

export default CreatedStep;
