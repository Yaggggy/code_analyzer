import { useState, useRef } from "react";
import { Loader2, Copy } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { Separator } from "./components/ui/separator";

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
      const response = await fetch("/.netlify/functions/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

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
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          alert("Analysis copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-sky-500 animate-pulse">
          Code Analyzer
        </h1>

        <Card className="bg-gray-800 text-gray-100 border-gray-700 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Input Your Code</CardTitle>
            <CardDescription className="text-gray-400">
              Paste your Python, JavaScript, or any other language code below to
              get a detailed complexity analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="w-full h-72 bg-gray-900 border-gray-600 text-white focus:ring-teal-500 focus:border-teal-500"
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleAnalyze}
              disabled={loading || !code}
              className="bg-gradient-to-r from-teal-500 to-sky-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:from-teal-600 hover:to-sky-700 transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Code"
              )}
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <div className="mt-8 p-4 bg-red-900 text-red-300 border border-red-700 rounded-lg shadow-md animate-fade-in-up">
            <p className="text-lg font-semibold">{error}</p>
          </div>
        )}

        {analysis && (
          <Card className="mt-8 bg-gray-800 text-gray-100 border-gray-700 shadow-2xl animate-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-teal-400">
                  Analysis Results
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed breakdown of the code's complexity.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="text-gray-400 hover:text-teal-400"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent ref={analysisRef}>
              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-sky-400">
                    Time Complexity
                  </h3>
                  <p className="mt-1 text-gray-300">
                    {analysis.time_complexity}
                  </p>
                </div>
                <Separator className="bg-gray-700" />
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-sky-400">
                    Space Complexity
                  </h3>
                  <p className="mt-1 text-gray-300">
                    {analysis.space_complexity}
                  </p>
                </div>
                <Separator className="bg-gray-700" />
                <div className="p-4 bg-gray-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-sky-400">
                    Explanation
                  </h3>
                  <p className="mt-1 text-gray-300 whitespace-pre-wrap">
                    {analysis.explanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
