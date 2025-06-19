/**
 * ArticlePanel.jsx
 * Displays individual translation word articles in their own tab
 */

import React, { useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RcLinkContext } from "./MainView";
import { processRcLinks } from "../utils/rcLinkUtils.jsx";

/**
 * Panel component for displaying a single article
 * @param {object} props
 * @param {object} props.article - Article data with title, content, rcUri
 * @param {object} props.reference - Current reference context (optional, for consistency)
 */
export function ArticlePanel({ article, reference }) {
  const { handleRcLinkClick } = useContext(RcLinkContext) || {};

  if (!article) {
    return (
      <div data-testid='article-panel-empty'>
        <p>No article selected.</p>
      </div>
    );
  }

  return (
    <article data-testid='article-panel' style={{ lineHeight: "1.6" }}>
      <header
        style={{ marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}
      >
        <h2 style={{ margin: "0 0 8px 0", color: "var(--color-primary)" }}>{article.title}</h2>
        {article.rcUri && (
          <p style={{ margin: 0, fontSize: "0.9em", color: "var(--color-text-muted)" }}>
            Source: <code>{article.rcUri}</code>
          </p>
        )}
      </header>

      <div style={{ fontSize: "16px", color: "var(--color-text)" }}>
        {article.content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 style={{ margin: "20px 0 16px 0", color: "var(--color-primary)", fontSize: "24px" }}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ margin: "20px 0 16px 0", color: "var(--color-primary)", fontSize: "20px" }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ margin: "16px 0 12px 0", color: "var(--color-primary)", fontSize: "18px" }}>
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 style={{ margin: "14px 0 10px 0", color: "var(--color-primary)", fontSize: "16px" }}>
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 style={{ margin: "12px 0 8px 0", color: "var(--color-primary)", fontSize: "15px" }}>
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 style={{ margin: "10px 0 6px 0", color: "var(--color-primary)", fontSize: "14px" }}>
                  {children}
                </h6>
              ),
              p: ({ children }) => (
                <p style={{ margin: "0 0 12px 0", lineHeight: "1.5" }}>{children}</p>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: "0 0 12px 0", paddingLeft: "20px" }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: "0 0 12px 0", paddingLeft: "20px" }}>{children}</ol>
              ),
              li: ({ children }) => <li style={{ margin: "4px 0" }}>{children}</li>,
              blockquote: ({ children }) => (
                <blockquote
                  style={{
                    margin: "12px 0",
                    padding: "8px 16px",
                    borderLeft: "4px solid var(--color-primary)",
                    backgroundColor: "var(--color-surface-hover)",
                    fontStyle: "italic",
                  }}
                >
                  {children}
                </blockquote>
              ),
              code: ({ children, inline }) =>
                inline ? (
                  <code
                    style={{
                      backgroundColor: "var(--color-surface-hover)",
                      padding: "2px 4px",
                      borderRadius: "3px",
                      fontSize: "0.9em",
                    }}
                  >
                    {children}
                  </code>
                ) : (
                  <pre
                    style={{
                      backgroundColor: "var(--color-surface-hover)",
                      padding: "12px",
                      borderRadius: "4px",
                      overflow: "auto",
                      margin: "12px 0",
                    }}
                  >
                    <code>{children}</code>
                  </pre>
                ),
              strong: ({ children }) => <strong style={{ fontWeight: "600" }}>{children}</strong>,
              em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
              hr: () => (
                <hr
                  style={{
                    margin: "20px 0",
                    border: "none",
                    borderTop: "1px solid var(--color-border)",
                  }}
                />
              ),
              table: ({ children }) => (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    margin: "12px 0",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {children}
                </table>
              ),
              th: ({ children }) => (
                <th
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "var(--color-surface-hover)",
                    border: "1px solid var(--color-border)",
                    fontWeight: "600",
                    textAlign: "left",
                  }}
                >
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {children}
                </td>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        ) : (
          <p style={{ fontStyle: "italic", color: "var(--color-text-muted)" }}>
            No content available for this article.
          </p>
        )}
      </div>

      {article.error && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            backgroundColor: "var(--color-warning-light)",
            border: "1px solid var(--color-warning-dark)",
            borderRadius: "4px",
            color: "var(--color-warning)",
          }}
        >
          <strong>Error loading content:</strong> {article.error}
        </div>
      )}
    </article>
  );
}
