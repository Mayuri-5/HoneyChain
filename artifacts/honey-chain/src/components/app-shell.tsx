import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import { useClerk } from '@clerk/react';
import { Bell, Blocks, Boxes, ChevronLeft, ChevronRight, CircleUserRound, ClipboardCheck, Database, FlaskConical, Flower2, Grape, Hexagon, Home, LineChart, LogOut, Menu, PackageCheck, ScanLine, Settings2, Sprout, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const primaryNav = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/apiaries', label: 'Apiaries', icon: Flower2 },
  { href: '/hives', label: 'Hives & inspections', icon: Hexagon },
  { href: '/harvest', label: 'Harvest', icon: Grape },
  { href: '/batches', label: 'Batches', icon: Boxes },
];
const traceNav = [
  { href: '/quality', label: 'Quality', icon: FlaskConical },
  { href: '/processing', label: 'Processing', icon: PackageCheck },
  { href: '/supply-chain', label: 'Supply chain', icon: Truck },
  { href: '/blockchain', label: 'Ledger explorer', icon: Blocks },
];
const insightNav = [
  { href: '/analytics', label: 'Analytics', icon: LineChart },
  { href: '/predict', label: 'Yield forecast', icon: Sprout },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/dashboard" className="flex items-center gap-2.5" data-testid="link-brand">
    <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_5px_0_hsl(155_24%_12%/.12)]">
      <Hexagon className="size-5" strokeWidth={2.5} />
    </span>
    {!compact && <span className="font-display text-xl font-bold tracking-tight text-sidebar-foreground">honey<span className="text-primary">chain</span></span>}
  </Link>;
}

function NavGroup({ title, items, pathname, onNavigate }: { title: string; items: typeof primaryNav; pathname: string; onNavigate?: () => void }) {
  return <div className="space-y-1">
    <p className="px-3 pb-2 pt-4 font-mono-ui text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/45">{title}</p>
    {items.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} onClick={onNavigate} data-testid={`link-nav-${href.slice(1)}`} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active ? 'bg-primary font-semibold text-primary-foreground shadow-[0_4px_16px_hsl(43_87%_49%/.16)]' : 'text-sidebar-foreground/68 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`}>
        <Icon className={`size-[17px] transition-transform group-hover:scale-105 ${active ? '' : 'text-sidebar-foreground/55'}`} />
        <span>{label}</span>
        {active && <span className="ml-auto size-1.5 rounded-full bg-sidebar-foreground/70" />}
      </Link>;
    })}
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [pathname] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: me } = useGetMe({ query: { retry: false, queryKey: getGetMeQueryKey() } });
  const { signOut } = useClerk();

  const doSignOut = () => signOut({ redirectUrl: '/' });
  const sidebar = <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 transition-transform duration-300 lg:relative lg:translate-x-0 ${collapsed ? 'lg:w-[82px]' : ''} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2`}>
      <BrandMark compact={collapsed} />
      {!collapsed && <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-sidebar-foreground/45 hover:bg-sidebar-accent lg:hidden" data-testid="button-close-menu"><X className="size-4" /></button>}
    </div>
    <div className="mt-7 flex-1 overflow-y-auto">
      <NavGroup title="Keepers' desk" items={primaryNav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      <NavGroup title="Proof & movement" items={traceNav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      <NavGroup title="Read the season" items={insightNav} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      <div className="mt-5 border-t border-sidebar-border pt-3">
        <NavGroup title="Account" items={[{ href: '/profile', label: 'My profile', icon: CircleUserRound }]} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </div>
    </div>
    {!collapsed && <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-3">
      <div className="flex items-center gap-2"><span className="pulse-dot size-2 rounded-full bg-primary" /><span className="font-mono-ui text-[10px] uppercase tracking-wider text-primary">Chain is humming</span></div>
      <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/55">Every field note becomes a thread your customers can trust.</p>
    </div>}
    <button type="button" onClick={() => setCollapsed(!collapsed)} className="mt-3 hidden items-center justify-center rounded-xl p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent lg:flex" data-testid="button-collapse-sidebar">{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</button>
  </aside>;

  return <div className="grain flex min-h-[100dvh] bg-background">
    {sidebar}
    {mobileOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" data-testid="button-overlay-menu" />}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-md sm:px-7 lg:px-10">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-xl border border-border p-2 lg:hidden" onClick={() => setMobileOpen(true)} data-testid="button-open-menu"><Menu className="size-5" /></button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span className="font-mono-ui text-[11px] uppercase tracking-[.16em]">Field notebook</span><ChevronRight className="size-3.5" /><span className="text-foreground">{primaryNav.concat(traceNav, insightNav).find((item) => pathname.startsWith(item.href))?.label ?? 'Profile'}</span></div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/verify/demo" className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary sm:flex" data-testid="link-customer-passport"><ScanLine className="size-4 text-primary" />Customer view</Link>
          <button type="button" className="relative rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition hover:text-foreground" data-testid="button-notifications"><Bell className="size-[17px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" /></button>
          <div className="hidden h-7 w-px bg-border sm:block" />
          <Link href="/profile" className="flex items-center gap-2" data-testid="link-header-profile">
            <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{(me?.name ?? 'BK').split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
            <span className="hidden max-w-[130px] truncate text-sm font-semibold sm:block">{me?.name ?? 'Beekeeper'}</span>
          </Link>
          <button type="button" onClick={doSignOut} className="rounded-xl p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive" data-testid="button-sign-out"><LogOut className="size-4" /></button>
        </div>
      </header>
      <main className="app-enter mx-auto max-w-[1520px] px-4 py-7 sm:px-7 lg:px-10 lg:py-9">{children}</main>
    </div>
  </div>;
}

export function PublicHeader() {
  return <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
    <BrandMark />
    <nav className="hidden items-center gap-7 text-sm font-semibold text-foreground/70 md:flex">
      <a href="#how-it-works" data-testid="link-how-it-works">How it works</a>
      <a href="#passport" data-testid="link-passport-section">Honey Passport</a>
      <Link href="/sign-in" className="rounded-xl border border-border bg-card/70 px-4 py-2.5 text-foreground backdrop-blur transition hover:border-primary" data-testid="link-public-sign-in">Sign in</Link>
    </nav>
    <Link href="/sign-up" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_5px_0_hsl(155_24%_12%/.12)] transition hover:-translate-y-0.5" data-testid="link-public-sign-up">Start your apiary</Link>
  </header>;
}