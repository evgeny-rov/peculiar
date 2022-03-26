const parseMessage = (data: string) => {
  const commandName = data.split(' ', 1)[0];
  const args = data.slice(commandName.length + 1);
  return [commandName, args];
};

export default parseMessage;
