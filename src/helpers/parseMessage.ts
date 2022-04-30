const parseMessage = (data: string) => {
  const messageType = data.split(' ', 1)[0];
  const args = data.slice(messageType.length + 1);
  return [messageType, args];
};

export default parseMessage;
