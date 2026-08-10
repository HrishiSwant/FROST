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

export default function Fakenews() {
  const navigate = useNavigate();

  // =========================================================
  // MAIN STATE
  // =========================================================

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // SOURCE STATE
  // =========================================================

  const [sources, setSources] = useState([]);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const [activeSource, setActiveSource] = useState(null);
  const [sourceResults, setSourceResults] = useState(null);
  const [sourceLoading, setSourceLoading] = useState(false);

  const [sourceQuery, setSourceQuery] = useState("");

  // =========================================================
  // LOAD AVAILABLE SOURCES
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
    if (!text.trim() || loading) return;

    const userText = text.trim();

    setText("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userText,
      },
    ]);

    setLoading(true);

    const isURL = userText.startsWith("http");

    try {
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
          data?.error ||
            data?.message ||
            data?.errors ||
            `Server error (${res.status}).`
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            data?.data?.answer ||
            data?.answer ||
            data?.error ||
            "No response from server.",
        },
      ]);
    } catch (error) {
      console.error(
        "News analysis error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            error?.message ||
            "Failed to connect to FROST server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN SOURCE
  // =========================================================

  const openSource = async (source) => {
    setSourcesOpen(false);

    setActiveSource(source);
    setSourceResults(null);

    /*
     * Use the latest investigated claim as the
     * initial search query.
     */
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    const initialQuery =
      latestUserMessage?.content?.trim() || "";

    setSourceQuery(initialQuery);

    if (!initialQuery) {
      return;
    }

    await searchSource(
      source,
      initialQuery
    );
  };

  // =========================================================
  // SEARCH SELECTED SOURCE
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
  // SEARCH BUTTON
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
  // RETURN TO GOOGLE
  // =========================================================

  const showGoogleResults = () => {
    setActiveSource(null);
    setSourceResults(null);
    setSourceQuery("");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* =====================================================
          BACKGROUND / MAIN CONTAINER
      ===================================================== */}

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 py-10">

        {/* ===================================================
            BACK
        =================================================== */}

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* ===================================================
            HEADER
        =================================================== */}

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
                {activeSource
                  ? `${activeSource.name} news coverage`
                  : "Published fact-check results from Google"}
              </p>

            </div>

          </div>

          {/* =================================================
              OTHER SOURCES BUTTON
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

        {/* ===================================================
            GOOGLE VIEW
        =================================================== */}

        {!activeSource && (
          <GoogleFactCheckView
            messages={messages}
            loading={loading}
            text={text}
            setText={setText}
            checkNews={checkNews}
          />
        )}

        {/* ===================================================
            SOURCE VIEW
        =================================================== */}

        {activeSource && (
          <SourceView
            source={activeSource}
            query={sourceQuery}
            setQuery={setSourceQuery}
            results={sourceResults}
            loading={sourceLoading}
            onSearch={handleSourceSearch}
            onBack={showGoogleResults}
          />
        )}

      </div>

      {/* =====================================================
          SOURCE SLIDE PANEL
      ===================================================== */}

      {sourcesOpen && (
        <>

          {/* Overlay */}

          <div
            onClick={() =>
              setSourcesOpen(false)
            }
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}

          <aside className="fixed top-0 right-0 h-full w-[320px] sm:w-[380px] bg-[#07101f] border-l border-slate-800 z-50 shadow-2xl p-6 overflow-y-auto">

            {/* Panel Header */}

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

            {/* Source List */}

            <div className="space-y-3">

              {sources.length === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-400">
                  No additional sources are currently available.
                </div>
              )}

              {sources.map((source) => (

                <button
                  key={source.id}
                  onClick={() =>
                    openSource(source)
                  }
                  className="w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-slate-900 transition-all group"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {source.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {source.description}
                      </p>

                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />

                  </div>

                </button>

              ))}

            </div>

          </aside>

        </>
      )}

    </div>
  );
}


// =============================================================
// GOOGLE FACT CHECK VIEW
// =============================================================

function GoogleFactCheckView({
  messages,
  loading,
  text,
  setText,
  checkNews,
}) {
  return (
    <div className="max-w-[1100px]">

      {/* Chat */}

      <div className="space-y-4 max-h-[450px] overflow-y-auto mb-8 pr-2">

        {messages.length === 0 &&
          !loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">

              <ShieldCheck className="w-10 h-10 mx-auto mb-4 text-cyan-400" />

              <p className="text-slate-300">
                Paste a news article, claim, or URL below to begin an investigation.
              </p>

            </div>
          )}

        {messages.map(
          (msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                    : "bg-slate-900 text-slate-200 border border-slate-700"
                }`}
              >
                {msg.content}
              </div>

            </div>
          )
        )}

        {loading && (
          <div className="flex justify-start">

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-400 border border-slate-800">
              FROST is investigating published fact-checks...
            </div>

          </div>
        )}

      </div>

      {/* Input */}

      <textarea
        placeholder="Paste news text or article URL here..."
        className="w-full h-32 p-5 rounded-3xl text-lg resize-y focus:outline-none mb-6 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400 transition-all"
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
            checkNews();
          }

        }}
      />

      {/* Button */}

      <button
        onClick={checkNews}
        disabled={
          !text.trim() ||
          loading
        }
        className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-lg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading
          ? "Investigating Sources..."
          : "Investigate News"}
      </button>

    </div>
  );
}


// =============================================================
// GENERIC SOURCE VIEW
// =============================================================

function SourceView({
  source,
  query,
  setQuery,
  results,
  loading,
  onSearch,
  onBack,
}) {
  const articles =
    results?.articles || [];

  return (
    <div className="max-w-[1100px]">

      {/* =====================================================
          SOURCE HEADER
      ===================================================== */}

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
              News coverage from {source.name}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          SOURCE AVAILABILITY NOTICE
      ===================================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 mb-6">

        <p className="text-sm text-slate-300 leading-relaxed">

          <span className="font-semibold text-white">
            Source availability:
          </span>{" "}

          Results are displayed when relevant coverage is available from this source.
          You can also search this source directly using keywords or topics.

        </p>

      </div>

      {/* =====================================================
          SEARCH THIS SOURCE
      ===================================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-6 md:p-8 mb-8">

        <div className="mb-4">

          <h3 className="text-lg font-semibold text-white">
            Search this source
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Search for a claim, topic, person, event, or keyword.
          </p>

        </div>

        <form
          onSubmit={onSearch}
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

      {/* =====================================================
          RESULTS
      ===================================================== */}

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

          {results?.resultCount !== undefined && (
            <span className="text-sm text-slate-500">
              {results.resultCount} results
            </span>
          )}

        </div>

        {/* Loading */}

        {loading && (
          <div className="py-12 text-center">

            <div className="inline-flex items-center gap-3 text-slate-400">

              <div className="w-5 h-5 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />

              Searching {source.name}...

            </div>

          </div>
        )}

        {/* Error */}

        {!loading &&
          results?.error && (
            <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5 text-sm text-red-300">
              {results.error}
            </div>
          )}

        {/* No results */}

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
                Try searching with different keywords or a broader topic.
              </p>

            </div>
          )}

        {/* Articles */}

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

                    <div className="flex flex-col gap-4">

                      <div>

                        <h4 className="text-lg font-semibold text-white leading-snug">
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

                      </div>

                      {article.abstract && (
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {article.abstract}
                        </p>
                      )}

                      {article.url && (
                        <div>

                          <a
                            href={
                              article.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-all text-sm font-medium"
                          >
                            Read Article
                            <ExternalLink className="w-4 h-4" />
                          </a>

                        </div>
                      )}

                    </div>

                  </article>

                )
              )}

            </div>

          )}

      </div>

      {/* =====================================================
          BACK TO GOOGLE
      ===================================================== */}

      <button
        onClick={onBack}
        className="mt-6 text-sm text-slate-500 hover:text-cyan-400 transition-colors"
      >
        ← Back to Google Fact-Check Results
      </button>

    </div>
  );
}


// =============================================================
// DATE FORMATTER
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
