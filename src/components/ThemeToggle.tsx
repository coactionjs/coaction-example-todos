import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'todos-theme';

const applyTheme = (theme: Theme) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
};

const readTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
};

const NEXT_THEME: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system'
};

const THEME_META: Record<
  Theme,
  { icon: typeof Sun; label: string; title: string }
> = {
  system: { icon: Monitor, label: 'System theme', title: 'Theme: system' },
  light: { icon: Sun, label: 'Light theme', title: 'Theme: light' },
  dark: { icon: Moon, label: 'Dark theme', title: 'Theme: dark' }
};

/** Light / dark / system toggle persisted to localStorage. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const next = NEXT_THEME[theme];
  const { icon: Icon, label, title } = THEME_META[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={title}
      className={cn('size-8 text-muted-foreground')}
      onClick={() => setTheme(next)}
    >
      <Icon className="size-4" />
    </Button>
  );
}
