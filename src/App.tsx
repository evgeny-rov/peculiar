import React, { useState } from 'react';
import Welcome from './components/Welcome';
import ChatSession from './components/ChatSession';
import getSessionIdFromPathname from './helpers/getSessionIdFromPathname';
import './styles/app.scss';
import './styles/animations.scss';

const sessionId = getSessionIdFromPathname(window.location.pathname);

const App = () => {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(sessionId === null);

  const closeWelcome = () => setShouldShowWelcome(false);

  return (
    <div className="app">
      {shouldShowWelcome ? <Welcome onAction={closeWelcome} /> : <ChatSession sid={sessionId} />}
    </div>
  );
};

export default App;
