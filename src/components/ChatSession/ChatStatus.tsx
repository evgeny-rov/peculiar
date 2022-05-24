const ChatStatus = ({ info }: { info: string }) => {
  return (
    <div className="chat__status">
      <span className="txt-system txt-system_size_sm">{info}</span>
    </div>
  );
};

export default ChatStatus;
