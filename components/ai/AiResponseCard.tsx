"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

export interface AiResponseCardProps {
  budgetId?: string;
  category: string;
  allocatedAmount: number;
  priorYearAmount?: number;
  growthPercentage?: number;
  country?: string;
  year?: number;
  autoFetch?: boolean;
  onOutage?: () => void;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export function AiResponseCard({
  budgetId,
  category,
  allocatedAmount,
  priorYearAmount,
  growthPercentage,
  country = "India",
  year = 2025,
  autoFetch = false,
  onOutage,
}: AiResponseCardProps) {
  const [explanationText, setExplanationText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOutage, setIsOutage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Follow-up Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [showChatInput, setShowChatInput] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatAbortControllerRef = useRef<AbortController | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const userFollowUpCount = chatHistory.filter((m) => m.role === "user").length;
  const remainingFollowUps = 3 - userFollowUpCount;

  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);

  // Stream initial AI explanation
  const fetchExplanationStream = async () => {
    setIsLoading(true);
    setIsOutage(false);
    setIsRateLimited(false);
    setErrorMessage(null);
    setExplanationText("");
    setChatHistory([]);
    setShowChatInput(false);

    // Cancel existing request if active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          budget_id: budgetId,
          category,
          allocatedAmount,
          priorYearAmount,
          growthPercentage,
          country,
          year,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setIsRateLimited(true);
          const limitMsg = errorData.error?.message || "Hourly rate limit exceeded (5 requests/hour for guests).";
          setErrorMessage(limitMsg);
          setToastMessage(limitMsg);
          setIsLoading(false);
          return;
        }
        throw new Error(errorData.error?.message || "AI service unavailable");
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let hasReceivedData = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            if (dataStr === "[DONE]") {
              setIsLoading(false);
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                hasReceivedData = true;
                accumulatedText += parsed.text;
                setExplanationText(accumulatedText);
                setIsLoading(false);
              }
            } catch (err) {
              // Ignore non-json or incomplete chunks
            }
          }
        }
      }

      setIsLoading(false);
      if (!hasReceivedData && !accumulatedText) {
        throw new Error("Empty response received from AI engine");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("AI explain stream aborted gracefully");
        return;
      }

      console.error("AI Explain Stream Error:", err);
      setIsOutage(true);
      setIsLoading(false);
      setErrorMessage("AI explanation currently unavailable");
      setToastMessage("AI explanation currently unavailable");
      if (onOutage) {
        onOutage();
      }
    }
  };


  useEffect(() => {
    if (autoFetch) {
      fetchExplanationStream();
    } else {
      setExplanationText("");
      setIsLoading(false);
      setIsOutage(false);
      setErrorMessage(null);
      setChatHistory([]);
      setShowChatInput(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (chatAbortControllerRef.current) {
        chatAbortControllerRef.current.abort();
      }
    };
  }, [category, allocatedAmount, priorYearAmount, growthPercentage, country, year, budgetId, autoFetch]);

  // Handle follow-up chat submit
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || isChatLoading || remainingFollowUps <= 0) return;

    const userMsg = followUpInput.trim();
    setFollowUpInput("");
    setShowChatInput(true);

    const updatedHistory: ChatMessage[] = [...chatHistory, { role: "user", text: userMsg }];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);

    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    chatAbortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          budget_id: budgetId,
          category,
          allocatedAmount,
          priorYearAmount,
          growthPercentage,
          country,
          year,
          history: updatedHistory,
          followUpMessage: userMsg,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to send follow-up message");
      }

      if (!response.body) {
        throw new Error("No chat response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      // Placeholder for model response in history
      setChatHistory([...updatedHistory, { role: "model", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            if (dataStr === "[DONE]") {
              setIsChatLoading(false);
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                assistantResponse += parsed.text;
                setChatHistory([
                  ...updatedHistory,
                  { role: "model", text: assistantResponse },
                ]);
              }
            } catch (pErr) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      setIsChatLoading(false);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Chat Stream Error:", err);
      setIsChatLoading(false);
      setToastMessage("Failed to send follow-up message. AI service issue.");
    }
  };

  if (isRateLimited) {
    return (
      <>
        {toastMessage && (
          <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
        )}
        <div className="w-full p-4 rounded-xl bg-[#181818] border border-[#ea4335]/40 flex flex-col gap-2 text-xs text-[#ddffdc] shadow-md">
          <div className="flex items-center gap-2 text-[#ea4335] font-semibold">
            <AlertCircle className="w-4 h-4 text-[#ea4335]" />
            <span>Hourly Rate Limit Exceeded</span>
          </div>
          <p className="text-xs text-[#8cab87]">
            {errorMessage || "Guest limit reached (5 requests/hour). Sign in for 20 requests/hour."}
          </p>
        </div>
      </>
    );
  }

  if (isOutage) {
    return (
      <>
        {toastMessage && (
          <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
        )}
        <div className="w-full p-4 rounded-xl bg-[#181818] border border-[#485346] flex items-center justify-between text-xs text-[#8cab87]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8cab87]" />
            <span>AI explanation currently unavailable</span>
          </div>
          <button
            onClick={fetchExplanationStream}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#212525] text-[#ddffdc] font-medium border border-[#485346] hover:bg-[#7fee64] hover:text-[#181818] transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {toastMessage && (
        <Toast message={toastMessage} type="error" onClose={() => setToastMessage(null)} />
      )}

      <div className="w-full modal-card p-5 shadow-xl transition-colors duration-200 text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--badge-bg)] text-[var(--accent-pulse)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--accent-pulse)]">
              AI Explanation
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--text-secondary)]">
            {category}
          </span>
        </div>

        {/* Streaming Body / Typing Indicator */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="false"
          aria-busy={isLoading}
          aria-label={`AI explanation for ${category}`}
          className="text-sm leading-relaxed text-[var(--text-primary)] min-h-[50px]"
        >
          {!isLoading && !explanationText ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Click <strong className="text-[var(--text-primary)] font-medium">Explain with AI</strong> to generate a plain-language explanation of this category allocation using Gemini AI.
              </p>
              <button
                onClick={fetchExplanationStream}
                className="lime-pill-cta flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>Explain with AI</span>
              </button>
            </div>
          ) : isLoading && !explanationText ? (
            <div className="flex items-center gap-2 py-3 text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-pulse)] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-[var(--accent-pulse)] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[var(--accent-pulse)] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs italic text-[var(--text-secondary)]">Analyzing budget figures...</span>
            </div>
          ) : (
            <p className="whitespace-pre-line font-normal text-[var(--text-primary)]">
              {explanationText}
              {isLoading && <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent-pulse)] animate-pulse" />}
            </p>
          )}
        </div>

        {/* Chat History Messages */}
        {chatHistory.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-3">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`text-xs p-3 rounded-xl ${
                  msg.role === "user"
                    ? "bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] ml-4 font-medium"
                    : "bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[var(--text-primary)] mr-4"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">
                  {msg.role === "user" ? "You" : "AI Assistant"}
                </div>
                <div>
                  {msg.text || (
                    <span className="italic text-[var(--text-secondary)]">Thinking...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Follow-up Controls */}
        {!isLoading && explanationText && (
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            {!showChatInput && chatHistory.length === 0 ? (
              <button
                onClick={() => setShowChatInput(true)}
                className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-pulse)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask a follow-up question ({remainingFollowUps} left)
              </button>
            ) : (
              <form onSubmit={handleFollowUpSubmit} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>Follow-up discussion</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {remainingFollowUps} {remainingFollowUps === 1 ? "question" : "questions"} left
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    disabled={isChatLoading || remainingFollowUps <= 0}
                    placeholder={
                      remainingFollowUps > 0
                        ? "Ask e.g. Why did this allocation increase?"
                        : "Maximum 3 follow-ups reached for this session."
                    }
                    className="w-full text-xs px-3 py-2.5 pr-10 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-pulse)] disabled:opacity-60 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!followUpInput.trim() || isChatLoading || remainingFollowUps <= 0}
                    aria-label="Send follow-up question"
                    className="absolute right-1.5 p-1.5 rounded-lg lime-pill-cta text-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}

