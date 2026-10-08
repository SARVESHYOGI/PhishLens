import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/investigation', label: 'Investigation' },
    { to: '/evidence', label: 'Evidence' },
    { to: '/report', label: 'Report' },
    { to: '/ioc', label: 'IOC Search' },
    { to: '/history', label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark shadow-glow">
            <Shield className="h-5 w-5 text-background" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-foreground">MailSleuth</span>
            <span className="text-[10px] font-medium tracking-widest text-primary uppercase">AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                location.pathname === link.to ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
