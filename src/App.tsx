import './styles/app.scss';
import { useEffect } from 'react';
import getSessionContextFromUrl from './helpers/getSessionContextFromUrl';
import useSecureChatSession from './hooks/useSecureChatSession';
import ChatFeed from './components/Chat/ChatFeed';
import ChatInput from './components/Chat/ChatInput';
import ChatStatus from './components/Chat/ChatStatus';
import Error from './components/Error';
import EstablishingStep from './components/EstablishingStep';
import CreatedStep from './components/CreatedStep';

let didInit = false;

const App = () => {
  const session = useSecureChatSession();

  useEffect(() => {
    if (!didInit) {
      didInit = true;
      const sessionContext = getSessionContextFromUrl(window.location);
      session.establish(sessionContext);
    }
  }, []);

  const retry = () => {
    const sessionContext = getSessionContextFromUrl(window.location);
    session.establish(sessionContext);
  };

  const createNewSession = () => {
    window.location.hash = '';
    session.establish();
  };

  return (
    <div className="app">
      <div className="chat">
        <ChatStatus info={session.info} sessionHash={session.hash} isConnected={session.isLive} />
        {session.state === 'establishing' && <EstablishingStep info={session.info} />}
        {session.state === 'error' && (
          <Error info={session.info} onRetry={retry} onCreateNewSession={createNewSession} />
        )}
        {session.state === 'created' && <CreatedStep info={session.info} sessionId={session.id} />}
        {session.hash && <ChatFeed messages={session.messages} />}
        <ChatInput disabled={!session.isLive} send={session.send} />
      </div>
    </div>
  );
};

export default App;
