import Caret from './Caret';

const EstablishingStep = ({ info }: { info: string }) => {
  return (
    <main className="wrapper">
      <div>
        <Caret />
        <span className="txt-system txt-system_nonselectible">{info}</span>
      </div>
    </main>
  );
};

export default EstablishingStep;
