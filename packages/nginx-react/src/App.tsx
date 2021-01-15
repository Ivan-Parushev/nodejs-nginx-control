import * as React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

const App: React.FC = () => (
    <BrowserRouter>
        <Switch>
            <Route path="/">
                <div>React App</div>
            </Route>
        </Switch>
    </BrowserRouter>
);

export default App;
