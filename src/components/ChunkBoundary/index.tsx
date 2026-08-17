import { Component, ReactNode } from "react";
import { CHUNK_LABELS } from "@/customConstants/labels";

interface ChunkBoundaryProps {
  children: ReactNode;
}

interface ChunkBoundaryState {
  failed: boolean;
}

/**
 * A deploy renames every chunk, so a tab left open from before it holds a main
 * bundle asking for files that no longer exist. The dynamic import rejects,
 * Suspense never resolves, and the page renders its frame with nothing inside
 * - which looks exactly like a button that does nothing.
 *
 * That is a stale tab, not a broken app, and the fix is a reload. Saying so is
 * the entire job here.
 */
class ChunkBoundary extends Component<ChunkBoundaryProps, ChunkBoundaryState> {
  state: ChunkBoundaryState = { failed: false };

  static getDerivedStateFromError(error: unknown): ChunkBoundaryState {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : "";

    // Webpack rejects with ChunkLoadError; browsers phrase the underlying
    // network failure differently, hence the message check too.
    const isChunkFailure =
      name === "ChunkLoadError" ||
      /loading chunk|dynamically imported module|failed to fetch/i.test(message);

    return { failed: isChunkFailure };
  }

  componentDidCatch(error: unknown) {
    if (!this.state.failed) {
      // Anything else is a real bug and belongs where bugs are seen.
      throw error;
    }
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <div className="mx-auto flex max-w-md flex-col items-start gap-3 px-4 py-12">
        <h2 className="text-lg font-semibold text-ink">
          {CHUNK_LABELS.title}
        </h2>
        <p className="text-sm text-ink-muted">{CHUNK_LABELS.body}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          {CHUNK_LABELS.reload}
        </button>
      </div>
    );
  }
}

export default ChunkBoundary;
