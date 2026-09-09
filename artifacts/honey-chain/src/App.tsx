import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/lib/auth';
import NotFound from '@/pages/not-found';
import {
  AnalyticsPage,
  AlertsPage,
  ApiariesPage,
  BatchDetailPage,
  BatchesPage,
  BlockchainPage,
  DashboardPage,
  HarvestPage,
  HivesPage,
  LandingPage,
  SignInPage,
  PredictPage,
  ProcessingPage,
  ProfilePage,
  QrCodesPage,
  QualityPage,
  SupplyChainPage,
} from '@/pages/product-pages';
import { VerifyPage } from '@/pages/verify-passport-route';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function Router() {
  const [location] = useLocation();
  const { user } = useAuth();
  const routePath = basePath && basePath !== '/' && location.startsWith(basePath)
    ? location.slice(basePath.length) || '/'
    : location;
  const publicRoute = routePath === '/login' || routePath.startsWith('/login/') || routePath === '/register' || routePath.startsWith('/register/') || routePath === '/sign-in' || routePath.startsWith('/sign-in/') || routePath === '/sign-up' || routePath.startsWith('/sign-up/') || routePath === '/verify' || routePath.startsWith('/verify/');

  if (routePath === '/') return <Redirect to={user ? '/dashboard' : '/login'} />;
  if (!user && !publicRoute) return <Redirect to="/login" />;

  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/login" component={LoginRoute} />
        <Route path="/register" component={RegisterRoute} />
        <Route path="/sign-in/*?" component={LoginRoute} />
        <Route path="/sign-up/*?" component={RegisterRoute} />
        <Route path="/landing" component={LandingPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/apiaries" component={ApiariesPage} />
        <Route path="/hives" component={HivesPage} />
        <Route path="/harvest" component={HarvestPage} />
        <Route path="/batches" component={BatchesPage} />
        <Route path="/batches/:batchId" component={BatchDetailPage} />
        <Route path="/qr-codes" component={QrCodesPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/quality" component={QualityPage} />
        <Route path="/processing" component={ProcessingPage} />
        <Route path="/supply-chain" component={SupplyChainPage} />
        <Route path="/blockchain" component={BlockchainPage} />
        <Route path="/verify/:batchId" component={VerifyPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/predict" component={PredictPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function LoginRoute() {
  const { user } = useAuth();
  if (user) return <Redirect to="/dashboard" />;
  return <SignInPage />;
}

function RegisterRoute() {
  const { user } = useAuth();
  if (user) return <Redirect to="/dashboard" />;
  return <SignInPage signUp />;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
