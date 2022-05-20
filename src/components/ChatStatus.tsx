const ChatStatus = ({ info }: { info: string }) => {
  return (
    <div className="chat__status">
      <span>{info}</span>
    </div>
  );
};

export default ChatStatus;
