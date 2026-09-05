import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, Show, SignIn, SignUp } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  AnalyticsPage,
  ApiariesPage,
  BatchDetailPage,
  BatchesPage,
  BlockchainPage,
  DashboardPage,
  HarvestPage,
  HivesPage,
  LandingPage,
  PredictPage,
  ProcessingPage,
  ProfilePage,
  QualityPage,
  SupplyChainPage,
  VerifyPage,
} from '@/pages/product-pages';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#d59616',
    colorForeground: '#263b2f',
    colorMutedForeground: '#677267',
    colorDanger: '#bd473c',
    colorBackground: '#fffdf8',
    colorInput: '#f6f1e6',
    colorInputForeground: '#263b2f',
    colorNeutral: '#ddd6c9',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: '0.75rem',
  },
  elements: {
    cardBox: 'bg-[#fffdf8] rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#e3dccf]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#263b2f] font-bold',
    headerSubtitle: 'text-[#677267]',
    socialButtonsBlockButtonText: 'text-[#263b2f]',
    formFieldLabel: 'text-[#263b2f]',
    footerActionLink: 'text-[#a16a08]',
    footerActionText: 'text-[#677267]',
    dividerText: 'text-[#677267]',
    formButtonPrimary: 'bg-[#d59616] text-[#263b2f]',
    formFieldInput: 'bg-[#f6f1e6] text-[#263b2f] border-[#ddd6c9]',
    main: 'bg-transparent',
  },
};

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={SignInRoute} />
        <Route path="/sign-up/*?" component={SignUpRoute} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/apiaries" component={ApiariesPage} />
        <Route path="/hives" component={HivesPage} />
        <Route path="/harvest" component={HarvestPage} />
        <Route path="/batches" component={BatchesPage} />
        <Route path="/batches/:batchId" component={BatchDetailPage} />
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

function HomeRedirect() {
  return <><Show when="signed-in"><Redirect to="/dashboard" /></Show><Show when="signed-out"><LandingPage /></Show></>;
}

function SignInRoute() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}

function SignUpRoute() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Return to the field' } }, signUp: { start: { title: 'Create your notebook', subtitle: 'Make every jar knowable' } } }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
