import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HistoryControls } from '@/components/HistoryControls';
import { OpenNewTabButton } from '@/components/OpenNewTabButton';
import { StoreModeBadge } from '@/components/StoreModeBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AddTodo } from '@/components/todo/AddTodo';
import { TodoFooter } from '@/components/todo/TodoFooter';
import { TodoList } from '@/components/todo/TodoList';

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-4 sm:p-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="flex w-full max-w-xl items-center justify-between self-center">
          <div className="flex size-8 items-center" aria-hidden />
          <h1 className="font-mono text-5xl font-bold tracking-tighter text-primary/85">
            todos
          </h1>
          <div className="flex items-center gap-0.5">
            <HistoryControls />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>coaction · react · vite</span>
          <StoreModeBadge />
          <OpenNewTabButton />
        </div>
      </header>

      <Card className="w-full max-w-xl shadow-lg">
        <CardContent className="flex flex-col gap-1 p-4 sm:p-6">
          <AddTodo />
          <Separator className="my-3" />
          <TodoList />
          <TodoFooter />
        </CardContent>
      </Card>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        State lives in a SharedWorker and is mirrored to every connected tab —
        add or edit todos in two windows and watch them stay in sync.
      </p>
    </main>
  );
}

export default App;
