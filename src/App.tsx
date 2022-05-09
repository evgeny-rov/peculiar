import React, { useState } from 'react';
import ChatSession from './components/ChatSession';
import Welcome from './components/Welcome';
import getSessionIdFromPathname from './helpers/getSessionIdFromPathname';
import './styles/App.scss';

const sessionId = getSessionIdFromPathname(window.location.pathname);

const App = () => {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(sessionId === null);

  const closeWelcome = () => setShouldShowWelcome(false);

  return (
    <div className="App">
      {shouldShowWelcome ? <Welcome onAction={closeWelcome} /> : <ChatSession sid={sessionId} />}
    </div>
  );
};

export default App;
