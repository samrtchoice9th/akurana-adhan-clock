import { ArrowLeft, Palette, Layout, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme, ThemeColor, DesignStyle } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const COLORS: { value: ThemeColor; label: string; preview: string }[] = [
  { value: 'green', label: 'Emerald', preview: 'bg-[hsl(145,70%,45%)]' },
  { value: 'blue', label: 'Ocean', preview: 'bg-[hsl(215,80%,55%)]' },
  { value: 'dark', label: 'Midnight', preview: 'bg-[hsl(260,60%,50%)]' },
];

const STYLES: { value: DesignStyle; label: string; desc: string }[] = [
  { value: 'modern', label: 'Modern', desc: 'Rounded corners, soft shadows' },
  { value: 'classic', label: 'Classic', desc: 'Clean flat design' },
  { value: 'glass', label: 'Glass', desc: 'Frosted glass effects' },
];

export default function Settings() {
  const { color, style, setColor, setStyle } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6 max-w-md mx-auto">
      <header className="w-full flex items-center gap-3 mb-6">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-primary tracking-wide">Settings</h1>
      </header>

      {/* Theme Color */}
      <Card className="w-full bg-card border-border mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary flex items-center gap-2">
            <Palette className="h-4 w-4" /> Theme Color
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-3 gap-3">
            {COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300',
                  color === c.value
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.2)]'
                    : 'border-border hover:border-muted-foreground bg-card'
                )}
              >
                <div className={cn('h-10 w-10 rounded-full', c.preview)} />
                <span className="text-xs font-medium text-foreground">{c.label}</span>
                {color === c.value && (
                  <div className="absolute top-1.5 right-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Style */}
      <Card className="w-full bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary flex items-center gap-2">
            <Layout className="h-4 w-4" /> Design Style
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 text-left',
                  style === s.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground bg-card'
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                {style === s.value && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
