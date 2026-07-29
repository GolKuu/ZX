import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { AuthPage } from '../pages/AuthPage';
import { CharactersPage } from '../pages/CharactersPage';
import { ControlsPage } from '../pages/ControlsPage';
import { HomePage } from '../pages/HomePage';
import { LocalPvpPage } from '../pages/LocalPvpPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TrainingPage } from '../pages/TrainingPage';

const FightPage = lazy(() =>
  import('../pages/FightPage').then((module) => ({ default: module.FightPage })),
);

function FightRoute() {
  return (
    <Suspense fallback={<main className="route-loading">Готовим арену…</main>}>
      <FightPage />
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/local-pvp" component={LocalPvpPage} />
      <Route path="/fight" component={FightRoute} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/characters" component={CharactersPage} />
      <Route path="/controls" component={ControlsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
