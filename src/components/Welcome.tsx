export const Welcome = ({ onAction }: { onAction: () => void }) => {
  return (
    <button onClick={onAction} className="txt-btn txt-btn_type_pulse">
      <span className="caret">{'>_'}</span>
      <span>start session</span>
    </button>
  );
};

export default Welcome;
