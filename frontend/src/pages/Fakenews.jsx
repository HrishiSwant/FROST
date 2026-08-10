import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Search,
  X,
  Newspaper,
  ChevronRight,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://frost-7sn1.onrender.com";

const GOOGLE_SOURCE = {
  id: "google",
  name: "Google Fact Check",
  short_name: "Google",
  description:
    "Published fact-check results returned by Google.",
  type: "fact_check",
  search_enabled: true,
};

export default function Fakenews() {
  const navigate = useNavigate();

  // =========================================================
  // GOOGLE FACT CHECK
  // =========================================================

  const [text, setText] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleResults, setGoogleResults] = useState(null);

  // =========================================================
  // SOURCES
  // =========================================================

  const [sources, setSources] = useState([]);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const [activeSource, setActiveSource] =
    useState(GOOGLE_SOURCE);

  // =========================================================
  // OTHER SOURCE SEARCH
  // =========================================================

  const [sourceQuery, setSourceQuery] = useState("");
  const [sourceResults, setSourceResults] = useState(null);
  const [sourceLoading, setSourceLoading] = useState(false);

  // =========================================================
  // LOAD SOURCES
  // =========================================================

  useEffect(() => {
    const loadSources = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/news/sources`
        );

        const data = await res.json();

        if (res.ok && data?.success) {
          setSources(data?.data || []);
        }
      } catch (error) {
        console.error(
          "Failed to load news sources:",
          error
        );
      }
    };

    loadSources();
  }, []);

  // =========================================================
  // GOOGLE FACT CHECK
  // =========================================================

  const checkNews = async () => {
    if (!text.trim() || googleLoading) return;

    const userText = text.trim();

    setText("");

    setGoogleLoading(true);

    setActiveSource(GOOGLE_SOURCE);

    setSourceResults(null);

    try {
      const isURL = userText.startsWith("http");

      const res = await fetch(
        `${API_BASE}/api/news/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: isURL ? null : userText,
            url: isURL ? userText : null,
          }),
        }
      );

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${res.status}).`
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server error (${res.status}).`
        );
      }

      /*
       * IMPORTANT:
       *
       * V3 does NOT return data.answer.
       *
       * It returns:
       *
       * data.query
       * data.resultCount
       * data.sources
       */

      setGoogleResults(
        data?.data || null
      );
    } catch (error) {
      console.error(
        "Google Fact Check error:",
        error
      );

      setGoogleResults({
        error:
          error?.message ||
          "Failed to connect to FROST server.",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // =========================================================
  // OPEN SOURCE
  // =========================================================

  const openSource = async (source) => {
    setSourcesOpen(false);

    // -------------------------------------------------------
    // GOOGLE
    // -------------------------------------------------------

    if (source.id === "google") {
      setActiveSource(GOOGLE_SOURCE);
      setSourceResults(null);
      return;
    }

    // -------------------------------------------------------
    // OTHER SOURCE
    // -------------------------------------------------------

    setActiveSource(source);

    const currentQuery =
      googleResults?.query ||
      sourceQuery ||
      "";

    setSourceQuery(currentQuery);

    setSourceResults(null);

    if (currentQuery.trim()) {
      await searchSource(
        source,
        currentQuery
      );
    }
  };

  // =========================================================
  // SEARCH SOURCE
  // =========================================================

  const searchSource = async (
    source,
    query
  ) => {
    if (!source || !query?.trim()) return;

    setSourceLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/news/sources/${source.id}/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query.trim(),
          }),
        }
      );

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${res.status}).`
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.message ||
            `Source search failed (${res.status}).`
        );
      }

      setSourceResults(
        data?.data || null
      );
    } catch (error) {
      console.error(
        "Source search error:",
        error
      );

      setSourceResults({
        error:
          error?.message ||
          "Unable to search this source.",
      });
    } finally {
      setSourceLoading(false);
    }
  };

  // =========================================================
  // SEARCH SUBMIT
  // =========================================================

  const handleSourceSearch = (event) => {
    event.preventDefault();

    if (
      !sourceQuery.trim() ||
      !activeSource ||
      sourceLoading
    ) {
      return;
    }

    searchSource(
      activeSource,
      sourceQuery
    );
  };

  // =========================================================
  // ALL SOURCES
  // =========================================================

  const allSources = [
    GOOGLE_SOURCE,
    ...sources,
  ];

  // Remove duplicates if backend eventually
  // starts returning Google too.

  const uniqueSources = allSources.filter(
    (source, index, array) =>
      array.findIndex(
        (item) =>
          item.id === source.id
      ) === index
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-10">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between gap-6 mb-12">

          <div className="flex items-center gap-4">

            <div className="p-3 rounded-2xl bg-cyan-500/10">
              <ShieldCheck className="w-10 h-10 text-cyan-400" />
            </div>

            <div>

              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                Fake News Investigation
              </h1>

              <p className="text-slate-400 mt-1">
                {activeSource.id === "google"
                  ? "Published fact-check results from Google"
                  : `News coverage from ${activeSource.name}`}
              </p>

            </div>

          </div>

          {/* =================================================
              OTHER SOURCES
          ================================================= */}

          <button
            onClick={() =>
              setSourcesOpen(true)
            }
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700 bg-slate-900/70 text-slate-200 hover:border-cyan-400 hover:text-cyan-400 transition-all"
          >
            <Newspaper className="w-5 h-5" />

            <span className="hidden sm:inline">
              Other Sources
            </span>

            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

        {/* =================================================
            GOOGLE
        ================================================= */}

        {activeSource.id === "google" && (
          <GoogleView
            text={text}
            setText={setText}
            loading={googleLoading}
            results={googleResults}
            onCheck={checkNews}
          />
        )}

        {/* =================================================
            OTHER SOURCE
        ================================================= */}

        {activeSource.id !== "google" && (
          <SourceView
            source={activeSource}
            query={sourceQuery}
            setQuery={setSourceQuery}
            results={sourceResults}
            loading={sourceLoading}
            onSearch={handleSourceSearch}
          />
        )}

      </div>

      {/* ===================================================
          SOURCE PANEL
      =================================================== */}

      {sourcesOpen && (
        <>
          <div
            onClick={() =>
              setSourcesOpen(false)
            }
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <aside className="fixed top-0 right-0 h-full w-[320px] sm:w-[380px] bg-[#07101f] border-l border-slate-800 z-50 shadow-2xl p-6 overflow-y-auto">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-xl font-semibold text-white">
                  Other Sources
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Explore additional coverage
                </p>

              </div>

              <button
                onClick={() =>
                  setSourcesOpen(false)
                }
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* SOURCE LIST */}

            <div className="space-y-3">

              {uniqueSources.map(
                (source) => {

                  const isActive =
                    source.id ===
                    activeSource.id;

                  return (
                    <button
                      key={source.id}
                      onClick={() =>
                        openSource(source)
                      }
                      className={`w-full text-left p-5 rounded-2xl border transition-all group ${
                        isActive
                          ? "border-cyan-400/50 bg-cyan-500/5"
                          : "border-slate-800 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-slate-900"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h3
                            className={`font-medium transition-colors ${
                              isActive
                                ? "text-cyan-400"
                                : "text-white group-hover:text-cyan-400"
                            }`}
                          >
                            {source.name}
                          </h3>

                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            {source.description}
                          </p>

                        </div>

                        <ChevronRight
                          className={`w-5 h-5 flex-shrink-0 ${
                            isActive
                              ? "text-cyan-400"
                              : "text-slate-600 group-hover:text-cyan-400"
                          }`}
                        />

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </aside>
        </>
      )}

    </div>
  );
}


// =============================================================
// GOOGLE VIEW
// =============================================================

function GoogleView({
  text,
  setText,
  loading,
  results,
  onCheck,
}) {
  const sources =
    results?.sources || [];

  return (
    <div className="max-w-[1100px]">

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 md:p-8 mb-8">

        <div className="mb-5">

          <h2 className="text-xl font-semibold text-white">
            Search Published Fact-Checks
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Enter a claim or article URL to find published fact-checks.
          </p>

        </div>

        <textarea
          placeholder="Paste news text or article URL here..."
          className="w-full h-32 p-5 rounded-3xl text-lg resize-y focus:outline-none mb-5 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400 transition-all"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          onKeyDown={(e) => {

            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              onCheck();
            }

          }}
        />

        <button
          onClick={onCheck}
          disabled={
            !text.trim() ||
            loading
          }
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-lg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading
            ? "Searching Published Fact-Checks..."
            : "Investigate News"}
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {results?.error && (
        <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 text-red-300 mb-6">
          {results.error}
        </div>
      )}

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {!loading &&
        !results?.error &&
        results &&
        sources.length > 0 && (

          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 md:p-8">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-2xl font-semibold text-white">
                  Fact-Check Sources
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Published fact-checks returned by Google
                </p>

              </div>

              <span className="text-sm text-slate-500">
                {results.resultCount} sources
              </span>

            </div>

            <div className="space-y-5">

              {sources.map(
                (source, index) => (

                  <FactCheckCard
                    key={
                      source.url ||
                      index
                    }
                    source={source}
                  />

                )
              )}

            </div>

          </div>

        )}

      {/* =====================================================
          NO RESULTS
      ===================================================== */}

      {!loading &&
        !results?.error &&
        results &&
        sources.length === 0 && (

          <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-10 text-center">

            <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-slate-600" />

            <h3 className="text-lg font-semibold text-white">
              No published fact-checks found
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Google did not return any published fact-check results for this query.
            </p>

          </div>

        )}

    </div>
  );
}


// =============================================================
// GOOGLE FACT CHECK CARD
// =============================================================

function FactCheckCard({
  source,
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:p-6">

      <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
        {source.publisher ||
          "Publisher"}
      </p>

      <h3 className="text-xl font-semibold text-white mt-3">
        {source.title ||
          "Published Fact-Check"}
      </h3>

      {source.factCheckedClaim && (
        <div className="mt-5">

          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Fact-checked claim
          </p>

          <p className="text-slate-300">
            {source.factCheckedClaim}
          </p>

        </div>
      )}

      {source.rating && (
        <div className="mt-5">

          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Publisher rating
          </p>

          <p className="text-slate-300">
            {source.rating}
          </p>

        </div>
      )}

      {source.reviewDate && (
        <p className="text-xs text-slate-500 mt-5">
          Reviewed:{" "}
          {formatDate(
            source.reviewDate
          )}
        </p>
      )}

      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-medium"
        >
          Read Full Fact-Check
          <ExternalLink className="w-4 h-4" />
        </a>
      )}

    </article>
  );
}


// =============================================================
// OTHER SOURCE VIEW
// =============================================================

function SourceView({
  source,
  query,
  setQuery,
  results,
  loading,
  onSearch,
}) {
  const articles =
    results?.articles || [];

  return (
    <div className="max-w-[1100px]">

      {/* SOURCE HEADER */}

      <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 md:p-8 mb-6">

        <div className="flex items-start gap-4">

          <div className="p-3 rounded-2xl bg-cyan-500/10">
            <Newspaper className="w-7 h-7 text-cyan-400" />
          </div>

          <div>

            <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              {source.short_name ||
                source.name}
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-1">
              {source.name}
            </h2>

            <p className="text-slate-400 mt-2">
              News coverage from{" "}
              {source.name}
            </p>

          </div>

        </div>

      </div>

      {/* AVAILABILITY */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 mb-6">

        <p className="text-sm text-slate-300 leading-relaxed">

          <span className="font-semibold text-white">
            Source availability:
          </span>{" "}

          Results are displayed when relevant coverage is available from this source.
          You can also search this source directly using keywords or topics.

        </p>

      </div>

      {/* SEARCH */}

      <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 md:p-8 mb-8">

        <h3 className="text-lg font-semibold text-white">
          Search this source
        </h3>

        <p className="text-sm text-slate-500 mt-1 mb-5">
          Search for a claim, topic, person, event, or keyword.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (
              query.trim() &&
              !loading
            ) {
              onSearch(e);
            }
          }}
          className="flex flex-col sm:flex-row gap-3"
        >

          <div className="relative flex-1">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />

            <input
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder={`Search ${source.short_name || source.name}...`}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
            />

          </div>

          <button
            type="submit"
            disabled={
              !query.trim() ||
              loading
            }
            className="h-14 px-7 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

        </form>

      </div>

      {/* RESULTS */}

      <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 md:p-8">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h3 className="text-xl font-semibold text-white">
              {source.name} Results
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Articles returned by the source
            </p>

          </div>

          {results?.resultCount !==
            undefined && (
            <span className="text-sm text-slate-500">
              {results.resultCount} results
            </span>
          )}

        </div>

        {/* LOADING */}

        {loading && (
          <div className="py-12 text-center">

            <div className="inline-flex items-center gap-3 text-slate-400">

              <div className="w-5 h-5 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />

              Searching{" "}
              {source.name}...

            </div>

          </div>
        )}

        {/* ERROR */}

        {!loading &&
          results?.error && (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 text-sm text-red-300">
              {results.error}
            </div>
          )}

        {/* ARTICLES */}

        {!loading &&
          !results?.error &&
          articles.length > 0 && (

            <div className="space-y-4">

              {articles.map(
                (article, index) => (

                  <article
                    key={
                      article.url ||
                      index
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:p-6 hover:border-slate-700 transition-all"
                  >

                    <h4 className="text-lg font-semibold text-white">
                      {article.title ||
                        "Untitled article"}
                    </h4>

                    {article.publishedDate && (
                      <p className="text-xs text-slate-500 mt-2">
                        {formatDate(
                          article.publishedDate
                        )}
                      </p>
                    )}

                    {article.abstract && (
                      <p className="text-sm text-slate-400 leading-relaxed mt-4">
                        {article.abstract}
                      </p>
                    )}

                    {article.url && (
                      <a
                        href={
                          article.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-medium"
                      >
                        Read Article
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                  </article>

                )
              )}

            </div>

          )}

        {/* NO RESULTS */}

        {!loading &&
          !results?.error &&
          results &&
          articles.length === 0 && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">

              <Newspaper className="w-8 h-8 mx-auto mb-3 text-slate-600" />

              <p className="text-slate-300 font-medium">
                No articles were returned.
              </p>

              <p className="text-sm text-slate-500 mt-2">
                Try different keywords or a broader topic.
              </p>

            </div>

          )}

      </div>

    </div>
  );
}


// =============================================================
// DATE
// =============================================================

function formatDate(date) {
  try {
    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  } catch {
    return date;
  }
}
