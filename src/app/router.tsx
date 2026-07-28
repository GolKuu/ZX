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
import { TeamModesPage } from '../pages/TeamModesPage';
import { TeamOnlineLobbyPage } from '../pages/TeamOnlineLobbyPage';
import { VisualStyleGuidePage } from '../pages/VisualStyleGuidePage';
import { AiFightSetupPage } from '../pages/AiFightSetupPage';
import { ArenaViewerPage } from '../pages/ArenaViewerPage';
import { CharacterViewerPage } from '../pages/CharacterViewerPage';
import { EffectsGalleryPage } from '../pages/EffectsGalleryPage';

const FightPage = lazy(() =>
  import('../pages/FightPage').then((module) => ({ default: module.FightPage })),
);
const OnlineFightPage = lazy(() =>
  import('../pages/OnlineFightPage').then((module) => ({
    default: module.OnlineFightPage,
  })),
);
const TeamFightPage = lazy(() =>
  import('../pages/TeamFightPage').then((module) => ({
    default: module.TeamFightPage,
  })),
);
const TeamOnlineFightPage = lazy(() =>
  import('../pages/TeamOnlineFightPage').then((module) => ({
    default: module.TeamOnlineFightPage,
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

function TeamFightRoute() {
  return (
    <Suspense fallback={<main className="route-loading">Готовим командную арену…</main>}>
      <TeamFightPage />
    </Suspense>
  );
}

function TeamOnlineFightRoute() {
  return (
    <Suspense fallback={<main className="route-loading">Подключаем командную арену…</main>}>
      <TeamOnlineFightPage />
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/local-pvp" component={LocalPvpPage} />
      <Route path="/vs-ai" component={AiFightSetupPage} />
      <Route path="/fight" component={FightRoute} />
      <Route path="/team-modes" component={TeamModesPage} />
      <Route path="/team-fight" component={TeamFightRoute} />
      <Route path="/online-team-fight/:roomCode" component={TeamOnlineFightRoute} />
      <Route path="/online-team/:roomCode" component={TeamOnlineLobbyPage} />
      <Route path="/online-team" component={TeamOnlineLobbyPage} />
      <Route path="/online-fight/:roomCode" component={OnlineFightRoute} />
      <Route path="/online/:roomCode" component={OnlineLobbyPage} />
      <Route path="/online" component={OnlineLobbyPage} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/characters" component={CharactersPage} />
      <Route path="/character-viewer" component={CharacterViewerPage} />
      <Route path="/effects-gallery" component={EffectsGalleryPage} />
      <Route path="/arena-viewer" component={ArenaViewerPage} />
      <Route path="/visual-style-guide" component={VisualStyleGuidePage} />
      <Route path="/controls" component={ControlsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/players/:playerId" component={PublicPlayerPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
