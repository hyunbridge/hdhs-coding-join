import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Apply, Home, NotFound, SignIn } from './screens';

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/apply" component={Apply} />
        <Route path="/signIn" component={SignIn} />
        <Route path="*" component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
