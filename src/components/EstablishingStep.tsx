const EstablishingStep = ({ info }: { info: string }) => {
  return (
    <main className="wrapper">
      <div>
        <span className="caret">{'>_'}</span>
        <span className="txt-system txt-system_nonselectible">{info}</span>
      </div>
    </main>
  );
};

export default EstablishingStep;
