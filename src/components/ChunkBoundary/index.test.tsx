import { render, screen } from "@testing-library/react";
import ChunkBoundary from "@/components/ChunkBoundary";
import { CHUNK_LABELS } from "@/customConstants/labels";

const Boom = ({ error }: { error: Error }) => {
  throw error;
};

const chunkError = () => {
  const error = new Error("Loading chunk 495 failed.");
  error.name = "ChunkLoadError";
  return error;
};

describe("ChunkBoundary", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // React logs every caught error; the noise is not the point of the test.
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => consoleError.mockRestore());

  it("renders its children when nothing goes wrong", () => {
    render(
      <ChunkBoundary>
        <p>the page</p>
      </ChunkBoundary>,
    );

    expect(screen.getByText("the page")).toBeInTheDocument();
  });

  it("explains a stale tab instead of leaving an empty frame", () => {
    // A deploy renames every chunk, so an open tab asks for files that no
    // longer exist - which looked exactly like a button doing nothing.
    render(
      <ChunkBoundary>
        <Boom error={chunkError()} />
      </ChunkBoundary>,
    );

    expect(screen.getByText(CHUNK_LABELS.title)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: CHUNK_LABELS.reload }),
    ).toBeInTheDocument();
  });

  it("recognises the phrasing browsers use for the same failure", () => {
    render(
      <ChunkBoundary>
        <Boom error={new Error("Failed to fetch dynamically imported module")} />
      </ChunkBoundary>,
    );

    expect(screen.getByText(CHUNK_LABELS.title)).toBeInTheDocument();
  });

  it("does not swallow a real bug", () => {
    // Anything that is not a missing chunk belongs where bugs are seen.
    expect(() =>
      render(
        <ChunkBoundary>
          <Boom error={new Error("cannot read property of undefined")} />
        </ChunkBoundary>,
      ),
    ).toThrow();
  });
});
