import React, { useEffect } from 'react';
import getSessionContextFromUrl from './helpers/getSessionContextFromUrl';
import useSecureChatSession from './hooks/useSecureChatSession';
import WelcomeStep from './components/WelcomeStep';
import EstablishingStep from './components/EstablishingStep';
import CreatedStep from './components/CreatedStep';
import Chat from './components/Chat';
import './styles/app.scss';

const App = () => {
  const session = useSecureChatSession();

  useEffect(() => {
    const sessionContext = getSessionContextFromUrl(window.location.pathname);
    const shouldAutoConnect = sessionContext !== null;
    if (shouldAutoConnect) session.establish(sessionContext);

    return () => session.terminate();
  }, []);

  return (
    <div className="app">
      {session.state === 'initial' && <WelcomeStep onAction={session.establish} />}
      {session.state === 'establishing' && <EstablishingStep info={session.info} />}
      {session.state === 'created' && <CreatedStep info={session.info} sessionId={session.id} />}
      {session.state === 'established' && (
        <Chat
          isLive={true}
          messages={session.messages}
          sessionHash={session.hash}
          info={session.info}
          send={session.send}
        />
      )}
      {session.state === 'terminated' && (
        <Chat
          isLive={false}
          messages={session.messages}
          sessionHash={session.hash}
          info={session.info}
          send={session.send}
        />
      )}
    </div>
  );
};

export default App;
