export const Welcome = ({ onAction }: { onAction: () => void }) => {
  return (
    <button onClick={onAction} className="btn-txt btn-txt_pulsating">
      <span className="caret">{'>_'}</span>
      <span className="txt-system">start session</span>
    </button>
  );
};

export default Welcome;
