import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, BarChart3, Scale, History, Trash2, Send, RotateCcw } from 'lucide-react';

interface BiasAnalysis {
  bias_score: number;
  issues: string[];
  confidence: number;
}

interface InputAnalysis {
  complexity: string;
  category: string;
  context: string;
  reasoning_type: string;
}

interface HistoryItem {
  input: string;
  response: string;
  analysis: InputAnalysis;
  bias_analysis: BiasAnalysis;
  timestamp: string;
}

interface AnalysisResult {
  response: string;
  analysis: InputAnalysis;
  bias_analysis: BiasAnalysis;
  suggestions: string[];
}

// Simulated ML components for the frontend
class BiasFilter {
  private biasKeywords = [
    'always', 'never', 'all people', 'everyone knows',
    'obviously', 'clearly', 'of course', 'definitely',
    'men are', 'women are', 'people from', 'typical'
  ];

  private balancedAlternatives: Record<string, string> = {
    'always': 'often',
    'never': 'rarely',
    'everyone knows': 'it is commonly understood',
    'obviously': 'it appears that',
    'clearly': 'it seems that',
    'definitely': 'likely'
  };

  detectBias(text: string): BiasAnalysis {
    let biasScore = 0;
    const detectedIssues: string[] = [];
    const textLower = text.toLowerCase();

    this.biasKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        biasScore += 1;
        detectedIssues.push(`Potential absolute statement: '${keyword}'`);
      }
    });

    const genderedPatterns = ['he/she', 'his/her', 'man/woman'];
    genderedPatterns.forEach(pattern => {
      if (textLower.includes(pattern)) {
        detectedIssues.push(`Consider using inclusive language instead of '${pattern}'`);
      }
    });

    return {
      bias_score: biasScore,
      issues: detectedIssues,
      confidence: Math.min(biasScore * 0.2, 1.0)
    };
  }

  suggestImprovements(text: string): { improvedText: string; suggestions: string[] } {
    let improvedText = text;
    const suggestions: string[] = [];

    Object.entries(this.balancedAlternatives).forEach(([biased, alternative]) => {
      if (text.toLowerCase().includes(biased)) {
        improvedText = improvedText.replace(new RegExp(biased, 'gi'), alternative);
        suggestions.push(`Replaced '${biased}' with '${alternative}'`);
      }
    });

    return { improvedText, suggestions };
  }
}

class InsightProcessor {
  private insightCategories = ['analytical', 'creative', 'practical', 'ethical', 'innovative'];
  private realWorldContexts = [
    'business environment', 'educational setting', 'social context',
    'technological landscape', 'environmental considerations'
  ];

  analyzeInput(userInput: string): InputAnalysis {
    return {
      complexity: this.assessComplexity(userInput),
      category: this.categorizeInput(userInput),
      context: this.identifyContext(userInput),
      reasoning_type: this.determineReasoningType(userInput)
    };
  }

  private assessComplexity(text: string): string {
    const wordCount = text.split(' ').length;
    const questionMarks = (text.match(/\?/g) || []).length;

    if (wordCount < 10) return 'low';
    if (wordCount < 30) return 'medium';
    return 'high';
  }

  private categorizeInput(text: string): string {
    const creativeKeywords = ['creative', 'innovative', 'brainstorm', 'idea', 'design'];
    const analyticalKeywords = ['analyze', 'compare', 'evaluate', 'assess', 'data'];
    const practicalKeywords = ['solve', 'implement', 'plan', 'strategy', 'action'];

    const textLower = text.toLowerCase();

    if (creativeKeywords.some(keyword => textLower.includes(keyword))) return 'creative';
    if (analyticalKeywords.some(keyword => textLower.includes(keyword))) return 'analytical';
    if (practicalKeywords.some(keyword => textLower.includes(keyword))) return 'practical';
    return 'general';
  }

  private identifyContext(text: string): string {
    for (const context of this.realWorldContexts) {
      if (context.split(' ').some(word => text.toLowerCase().includes(word))) {
        return context;
      }
    }
    return this.realWorldContexts[Math.floor(Math.random() * this.realWorldContexts.length)];
  }

  private determineReasoningType(text: string): string {
    if (text.includes('?')) return 'problem-solving';
    if (text.toLowerCase().includes('why') || text.toLowerCase().includes('how')) return 'explanatory';
    if (text.toLowerCase().includes('compare') || text.toLowerCase().includes('vs')) return 'comparative';
    return 'exploratory';
  }
}

function App() {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('response');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  const biasFilter = new BiasFilter();
  const insightProcessor = new InsightProcessor();

  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-app-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const generateAIResponse = (input: string, analysis: InputAnalysis): string => {
    return `Based on your ${analysis.reasoning_type} question about ${analysis.category} topics, here are some balanced insights:

This is a ${analysis.complexity} complexity question that requires careful consideration. In the context of ${analysis.context}, there are several perspectives to consider:

1. **Multiple Viewpoints**: Rather than assuming one correct answer, let's explore different angles and approaches to this topic.

2. **Real-world Application**: Consider how this applies to practical situations you might encounter in your daily life or professional environment.

3. **Limitations**: It's important to acknowledge what we don't know and areas where more information might be helpful for a complete understanding.

4. **Balanced Approach**: Instead of absolute statements, let's consider the nuances and trade-offs involved in this situation.

5. **Critical Thinking**: This encourages you to think deeper about the underlying assumptions and potential implications.

This response is generated by a prototype system designed to encourage critical thinking and avoid bias in reasoning.

*Note: This is a simulated response for demonstration purposes. In a production environment, this would integrate with advanced AI models.*`;
  };

  const analyzeInput = async () => {
    if (!userInput.trim()) {
      alert('Please enter some text to analyze.');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const analysis = insightProcessor.analyzeInput(userInput);
      const aiResponse = generateAIResponse(userInput, analysis);
      const biasAnalysis = biasFilter.detectBias(aiResponse);

      let finalResponse = aiResponse;
      let suggestions: string[] = [];

      if (biasAnalysis.bias_score > 0) {
        const improvement = biasFilter.suggestImprovements(aiResponse);
        finalResponse = improvement.improvedText;
        suggestions = improvement.suggestions;
      }

      const result: AnalysisResult = {
        response: finalResponse,
        analysis,
        bias_analysis: biasAnalysis,
        suggestions
      };

      const historyItem: HistoryItem = {
        input: userInput,
        response: finalResponse,
        analysis,
        bias_analysis: biasAnalysis,
        timestamp: new Date().toISOString()
      };

      const newHistory = [historyItem, ...history].slice(0, 10); // Keep only last 10 items
      setHistory(newHistory);
      localStorage.setItem('ai-app-history', JSON.stringify(newHistory));

      setResults(result);
      setShowResults(true);
      setActiveTab('response');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearInput = () => {
    setUserInput('');
    setShowResults(false);
    setResults(null);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all interaction history?')) {
      setHistory([]);
      localStorage.removeItem('ai-app-history');
    }
  };

  const getBiasLevel = (score: number): string => {
    if (score <= 1) return 'low';
    if (score <= 3) return 'medium';
    return 'high';
  };

  const getBiasColor = (level: string): string => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-indigo-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-800">AI Reasoning Assistant</h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">Bias-free reasoning and creative problem-solving</p>
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-semibold">
            <span className="mr-2">🎓</span>
            Prototype built by a student – Internship Project
          </div>
        </header>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <label htmlFor="user-input" className="block text-lg font-semibold text-gray-700 mb-4">
            What would you like to explore or solve?
          </label>
          <textarea
            id="user-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your question, problem, or topic you'd like to reason through..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                analyzeInput();
              }
            }}
          />
          <div className="flex gap-4 mt-6 flex-wrap">
            <button
              onClick={analyzeInput}
              disabled={isLoading || !userInput.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5" />
                  Analyze & Reason
                </>
              )}
            </button>
            <button
              onClick={clearInput}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Clear
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your input through bias filters and AI reasoning...</p>
          </div>
        )}

        {/* Results */}
        {showResults && results && (
          <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-gray-50 border-b">
              <button
                onClick={() => setActiveTab('response')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'response'
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Send className="w-5 h-5" />
                AI Response
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('bias')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'bias'
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Scale className="w-5 h-5" />
                Bias Check
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'response' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Send className="w-6 h-6 text-indigo-600" />
                    AI Reasoning Response
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                      {results.response}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    Input Analysis
                  </h3>
                  <div className="grid gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <div className="flex items-center justify-between">
                        <strong className="text-gray-700">Complexity Level:</strong>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getComplexityColor(results.analysis.complexity)}`}>
                          {results.analysis.complexity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <strong className="text-gray-700">Category:</strong>
                      <span className="ml-2 text-gray-600 capitalize">{results.analysis.category}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <strong className="text-gray-700">Context:</strong>
                      <span className="ml-2 text-gray-600 capitalize">{results.analysis.context}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <strong className="text-gray-700">Reasoning Type:</strong>
                      <span className="ml-2 text-gray-600 capitalize">{results.analysis.reasoning_type.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bias' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-indigo-600" />
                    Bias Assessment
                  </h3>
                  <div className="grid gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <div className="flex items-center justify-between">
                        <strong className="text-gray-700">Bias Score:</strong>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBiasColor(getBiasLevel(results.bias_analysis.bias_score))}`}>
                          {results.bias_analysis.bias_score}/5 ({getBiasLevel(results.bias_analysis.bias_score).toUpperCase()})
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <strong className="text-gray-700">Confidence Level:</strong>
                      <span className="ml-2 text-gray-600">{Math.round(results.bias_analysis.confidence * 100)}%</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <strong className="text-gray-700 block mb-2">Detected Issues:</strong>
                      <ul className="list-disc list-inside text-gray-600">
                        {results.bias_analysis.issues.length > 0 ? (
                          results.bias_analysis.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))
                        ) : (
                          <li>No significant bias indicators detected</li>
                        )}
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-indigo-500">
                      <strong className="text-gray-700 block mb-2">Applied Improvements:</strong>
                      <ul className="list-disc list-inside text-gray-600">
                        {results.suggestions.length > 0 ? (
                          results.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))
                        ) : (
                          <li>No improvements suggested</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-600" />
              Recent Interactions
            </h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-gray-500 py-8 italic">
                No interactions yet. Start by asking a question above!
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                      <span>🕒 {new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg mb-2">
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-600 font-semibold">Q:</span>
                        <span className="text-gray-700 italic">{item.input}</span>
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {item.response.substring(0, 200)}
                      {item.response.length > 200 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center text-white">
          <p className="mb-2">
            <span className="mr-2">💻</span>
            Built with React, TypeScript, and custom bias-filtering algorithms
          </p>
          <p className="text-sm opacity-90">
            <span className="mr-2">⚠️</span>
            This is a prototype for educational purposes. Responses should be verified for critical decisions.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;