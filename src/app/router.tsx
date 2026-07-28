import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import { AuthPage } from '../pages/AuthPage';
import { CharactersPage } from '../pages/CharactersPage';
import { ControlsPage } from '../pages/ControlsPage';
import { HomePage } from '../pages/HomePage';
import { LocalPvpPage } from '../pages/LocalPvpPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { OnlineLobbyPage } from '../pages/OnlineLobbyPage';
import { ProfilePage } from '../pages/ProfilePage';
import { PublicPlayerPage } from '../pages/PublicPlayerPage';
import { TrainingPage } from '../pages/TrainingPage';
import { VisualStyleGuidePage } from '../pages/VisualStyleGuidePage';

const FightPage = lazy(() =>
  import('../pages/FightPage').then((module) => ({ default: module.FightPage })),
);
const OnlineFightPage = lazy(() =>
  import('../pages/OnlineFightPage').then((module) => ({
    default: module.OnlineFightPage,
  })),
);

function FightRoute() {
  return (
    <Suspense fallback={<main className="route-loading">Готовим арену…</main>}>
      <FightPage />
    </Suspense>
  );
}

function OnlineFightRoute() {
  return (
    <Suspense fallback={<main className="route-loading">Подключаем онлайн-арену…</main>}>
      <OnlineFightPage />
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/local-pvp" component={LocalPvpPage} />
      <Route path="/fight" component={FightRoute} />
      <Route path="/online-fight/:roomCode" component={OnlineFightRoute} />
      <Route path="/online/:roomCode" component={OnlineLobbyPage} />
      <Route path="/online" component={OnlineLobbyPage} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/characters" component={CharactersPage} />
      <Route path="/visual-style-guide" component={VisualStyleGuidePage} />
      <Route path="/controls" component={ControlsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/players/:playerId" component={PublicPlayerPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
