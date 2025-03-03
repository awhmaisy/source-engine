"use client"

import { useState, useEffect } from "react"
import axios from "axios"

interface Option {
  text: string
}

interface TweetResponse {
  link: string
}

interface ApiError {
  error: string
  details?: string
  status?: number
  data?: string
}

// ASCII Art components
const AsciiLogo = () => {
  const asciiArt = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧⠀
⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋⠀
⠐⠀⠞⣱⠋⢰⠁⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋⠀⠀⠀
⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀⠀⠀⠀⠀
⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
@source_os v3.2
[only mei]
`;

  // Split the ASCII art and text portions
  const [artPortion, textPortion] = asciiArt.split('@source_os');
  
  return (
    <div className="ascii-header">
      <div>
        <pre style={{ 
          fontFamily: "Geist Mono",
          margin: 0,
          whiteSpace: "pre",
          lineHeight: 1.2
        }}>
          {artPortion}
        </pre>
        <pre style={{ 
          fontFamily: "Geist Mono",
          margin: 0,
          whiteSpace: "pre",
          lineHeight: 1.2,
          textAlign: "center"
        }}>
          @source_os{textPortion}
        </pre>
      </div>
    </div>
  );
};

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [refinedMessage, setRefinedMessage] = useState<string>("");
  const [tweetLink, setTweetLink] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [tweetLoading, setTweetLoading] = useState<boolean>(false);

  // Effect for handling scroll after message is refined
  useEffect(() => {
    if (refinedMessage) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [refinedMessage]);

  // Effect for handling tweet link opening
  useEffect(() => {
    if (tweetLink) {
      const timer = setTimeout(() => {
        window.open(tweetLink, "_blank", "noopener,noreferrer");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tweetLink]);


  const handleGenerate = async () => {
    if (!message.trim()) {
      setError({
        error: "Message is required",
        details: "Please enter a message to generate options",
      })
      return
    }

    setLoading(true)
    setError(null)
    try {
      console.log("Sending request to /api/generate with message:", message)
      const res = await axios.post<{ options: string[] }>("/api/generate", {
        message,
        instructions:
          "Take the following message and rewrite it by modifying diction, tone, and thematic elements to convey the same sentiment or theme without using the original text. Use a broad range of styles such as programming, prophetic, mystical, quantum physics, archaic, or mathematical concepts, or invent new styles as appropriate. Ensure the response is creative, unique, and contextually relevant for each generation.",
      })
      console.log("Received response:", res.data)

      if (res.data.options && Array.isArray(res.data.options) && res.data.options.length > 0) {
        setOptions(res.data.options.map((text) => ({ text })))
      } else {
        setError({
          error: "Invalid response format",
          details: "The API returned an empty or invalid options array",
        })
      }
    } catch (err) {
      console.error("Error in handleGenerate:", err)

      if (axios.isAxiosError(err)) {
        const apiError: ApiError = {
          error: err.response?.data?.error || "Failed to generate options",
          details: err.response?.data?.details || err.message,
          status: err.response?.status,
        }
        setError(apiError)
      } else {
        setError({
          error: "An unexpected error occurred",
          details: err instanceof Error ? err.message : "Unknown error",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRefine = async (optionNum: number, modification: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post<{ refined: string }>("/api/refine", {
        option: options[optionNum - 1].text,
        modification,
      })
      setRefinedMessage(res.data.refined)
    } catch (err) {
      console.error("Error in handleRefine:", err)
      if (axios.isAxiosError(err)) {
        setError({
          error: err.response?.data?.error || "Failed to refine option",
          details: err.response?.data?.details || err.message,
        })
      } else {
        setError({
          error: "An unexpected error occurred",
          details: err instanceof Error ? err.message : "Unknown error",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTweet = async () => {
    if (!refinedMessage) {
      setError({
        error: "No message to tweet",
        details: "Please generate and refine a message first",
      })
      return
    }

    setTweetLoading(true)
    setError(null)
    try {
      // Remove the ID part from the refined message
      const cleanMessage = refinedMessage.replace(/\s*\[[A-Z0-9]+\]$/, "")

      console.log("Sending tweet request with message:", cleanMessage)
      const res = await axios.post<TweetResponse>("/api/tweet", { message: cleanMessage })

      if (res.data.link) {
        setTweetLink(res.data.link)
        // Open the Twitter intent URL in a new window
        setTweetLink(res.data.link) // window.open is now handled by useEffect
      } else {
        setError({
          error: "Invalid response format",
          details: "The API did not return a valid Twitter link",
        })
      }
    } catch (err) {
      console.error("Error in handleTweet:", err)

      if (axios.isAxiosError(err)) {
        const apiError: ApiError = {
          error: err.response?.data?.error || "Failed to tweet",
          details: err.response?.data?.details || err.message,
          status: err.response?.status,
        }
        setError(apiError)
      } else {
        setError({
          error: "An unexpected error occurred",
          details: err instanceof Error ? err.message : "Unknown error",
        })
      }
    } finally {
      setTweetLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 md:p-24">
      <div className="tweet-container">
        {typeof window !== 'undefined' && (
          <>
            <AsciiLogo />
            <div className="terminal-frame">
              <div className="terminal-header">tweet</div>
              <div className="terminal-content">
                {/* Step 1: Input message */}
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="enter plain text here..."
                  disabled={loading}
                />
                <div className="button-container">
                  <button onClick={handleGenerate} disabled={loading}>
                    <span className={loading ? "processing-text" : "button-text"}>
                      {loading ? "making the call..." : "hear it from her"}
                    </span>
                  </button>
                </div>

                {/* Step 3: Display options */}
                {options.length > 0 && (
                  <div className="options-container">
                    <ul className="options-list">
                      {options.map((opt, i) => {
                        // Extract the text without the ID part
                        const textWithoutId = opt.text.replace(/\s*\[[A-Z0-9]+\]$/, "")

                        return (
                          <li key={`option-${i}-${opt.text.slice(0, 20)}`} className="option-item">
                            <div className="option-text">{textWithoutId}</div>
                            <div className="button-group">
                              <button
                                onClick={() => handleRefine(i + 1, "shorten but retain meaning, make language simpler")}
                                disabled={loading}
                                className="modify-button"
                              >
                                Modify
                              </button>
                              <button
                                onClick={() => {
                                  setRefinedMessage(textWithoutId)
                                  // Scroll will be handled by useEffect
                                }}
                                disabled={loading}
                                className="select-button"
                              >
                                Select
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Step 4: Show refined message */}
        {refinedMessage && (
          <div className="refined-container">
            <div className="refined-message">{refinedMessage.replace(/\s*\[[A-Z0-9]+\]$/, "")}</div>
            <button onClick={handleTweet} disabled={loading || tweetLoading}>
              {tweetLoading ? (
                <span>
                  Connecting<span className="loading-dots"></span>
                </span>
              ) : (
                "Execute Tweet"
              )}
            </button>
            {tweetLink && (
              <div className="tweet-link">
                <p>
                  Tweet prepared.{" "}
                  <a href={tweetLink} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-container">
            <p className="error-message">ERROR: {error.error}</p>
            {error.details && <p className="error-details">{error.details}</p>}
            {error.status && <p className="error-details">Status code: {error.status}</p>}
            {process.env.NODE_ENV === "development" && error.data && (
              <details>
                <summary>Technical details</summary>
                <pre className="error-data">{error.data}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

