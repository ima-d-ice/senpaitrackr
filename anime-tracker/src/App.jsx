import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Library from './pages/Library';
import Search from './pages/Search';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Switch>
          <Route path="/" exact component={Search} />
          <Route path="/library" component={Library} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;