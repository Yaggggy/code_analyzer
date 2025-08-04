import { useState, useRef } from "react";
import { Loader2, Copy } from "lucide-react";

function App() {
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analysisRef = useRef(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze code");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError("An error occurred during analysis.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (analysisRef.current) {
      const textToCopy = analysisRef.current.innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => alert("Analysis copied to clipboard!"))
          .catch((err) => {
            console.error("Failed to copy text: ", err);
            alert("Failed to copy text. Please try again.");
          });
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          alert("Analysis copied to clipboard!");
        } catch (err) {
          console.error("Fallback: Oops, unable to copy", err);
          alert("Failed to copy text. Please try again.");
        }
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="main-container">
      <h1 className="app-title">Code Analyzer</h1>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Input Your Code</h3>
          <p className="card-description">
            Paste your Python, JavaScript, or any other language code below to
            get a detailed complexity analysis.
          </p>
        </div>
        <div className="card-content">
          <textarea
            className="textarea-field"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="card-footer">
          <button
            onClick={handleAnalyze}
            disabled={loading || !code}
            className="action-button"
          >
            {loading ? (
              <>
                <Loader2 className="loading-icon" size={20} />
                Analyzing...
              </>
            ) : (
              "Analyze Code"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {analysis && (
        <div className="card analysis-results">
          <div className="header-with-button">
            <div>
              <h3 className="card-title">Analysis Results</h3>
              <p className="card-description">
                Detailed breakdown of the code's complexity.
              </p>
            </div>
            <button className="copy-button" onClick={copyToClipboard}>
              <Copy className="copy-icon" />
            </button>
          </div>
          <div className="card-content" ref={analysisRef}>
            <div className="analysis-section">
              <h4 className="analysis-title">Time Complexity</h4>
              <p className="analysis-text">{analysis.time_complexity}</p>
            </div>
            <div className="separator"></div>
            <div className="analysis-section">
              <h4 className="analysis-title">Space Complexity</h4>
              <p className="analysis-text">{analysis.space_complexity}</p>
            </div>
            <div className="separator"></div>
            <div className="analysis-section">
              <h4 className="analysis-title">Explanation</h4>
              <p className="analysis-text">{analysis.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
