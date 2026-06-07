// InterviewSession.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Copy,
  Edit2,
  Eye,
  Play,
  Search,
  Trash2,
} from "lucide-react";

import sessionService from "../../Services/sessionService";
import SessionViewModal from "../../Components/SessionViewModal";
import SessionEditModal from "../../Components/SessionEditModal";
import ConnectModal from "../../Components/ConnectModal";
import AILoader from "../../Components/AILoader";

const PAGE_SIZE = 5;
const ALL_SESSIONS_LIMIT = 1000;
const SESSIONS_ALL_QUERY_KEY = ["sessions", "all"];

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  try {
    const dateObj =
      typeof dateValue === "object" && dateValue._seconds
        ? new Date(dateValue._seconds * 1000)
        : new Date(dateValue);

    return dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

function getDateTime(dateValue) {
  if (!dateValue) return 0;

  try {
    const dateObj =
      typeof dateValue === "object" && dateValue._seconds
        ? new Date(dateValue._seconds * 1000)
        : new Date(dateValue);

    const time = dateObj.getTime();
    return Number.isNaN(time) ? 0 : time;
  } catch {
    return 0;
  }
}

function extractSessions(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.sessions)) return response.sessions;
  return [];
}

function extractSingleSession(response) {
  if (!response) return null;

  if (Array.isArray(response)) return response[0] || null;
  if (Array.isArray(response?.data)) return response.data[0] || null;
  if (Array.isArray(response?.sessions)) return response.sessions[0] || null;

  if (response._id || response.id) return response;
  if (response.session?._id || response.session?.id) return response.session;
  if (response.data?._id || response.data?.id) return response.data;

  return null;
}

function normalizeSession(session) {
  const id = (session?._id || session?.id || "").toString();
  const sessionStatus = session?.status || "active";

  const isExpired =
    sessionStatus === "completed" ||
    sessionStatus === "expired" ||
    session?.isExpired;

  return {
    id,
    company: session?.company || "",
    position: session?.position || session?.jobDescription || "",
    status: isExpired ? "expired" : "active",
    credits: session?.creditsUsed || session?.credits || 0,
    aiUsage: session?.aiUsage || session?.usage || 0,
    createdAt: session?.createdAt,
    raw: session,
  };
}

async function fetchAllSessions({ forceFresh = false } = {}) {
  const firstResponse = await sessionService.listSessions(
    1,
    ALL_SESSIONS_LIMIT,
    "",
    "",
    "all",
    "newest",
    { forceFresh }
  );

  const firstRows = extractSessions(firstResponse);

  const totalPages =
    Number(firstResponse?.totalPages) ||
    Math.ceil(
      (Number(firstResponse?.total) || firstRows.length) / ALL_SESSIONS_LIMIT
    ) ||
    1;

  let allRows = [...firstRows];

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, index) => index + 2
    );

    const remainingResponses = await Promise.all(
      remainingPages.map((pageNumber) =>
        sessionService
          .listSessions(
            pageNumber,
            ALL_SESSIONS_LIMIT,
            "",
            "",
            "all",
            "newest",
            { forceFresh }
          )
          .catch(() => null)
      )
    );

    remainingResponses.forEach((response) => {
      allRows = [...allRows, ...extractSessions(response)];
    });
  }

  const uniqueMap = new Map();

  allRows.forEach((session) => {
    const id = (session?._id || session?.id || "").toString();

    if (id) {
      uniqueMap.set(id, session);
    }
  });

  return Array.from(uniqueMap.values()).map(normalizeSession);
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-backdrop" onClick={onClose} />

      <div className="confirm-modal-box">
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>

          <button type="button" onClick={onClose} className="confirm-close-btn">
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Confirm({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  disabled = false,
}) {
  if (!open) return null;

  const handleBackdropClick = () => {
    if (!disabled) {
      onCancel();
    }
  };

  return (
    <div
      className="confirm-modal-overlay"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className="confirm-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-close-btn"
          onClick={onCancel}
          disabled={disabled}
          aria-label="Close confirmation modal"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        <div className="confirm-modal-body">
          <div className="confirm-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <h3 id="confirm-modal-title" className="confirm-modal-title">
            {title}
          </h3>

          <p className="confirm-message">{message}</p>

          <div className="confirm-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel-soft"
              disabled={disabled}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="btn-confirm-danger"
              disabled={disabled}
            >
              {disabled && (
                <span className="confirm-btn-spinner" aria-hidden="true" />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function SessionToast({ toast }) {
  if (!toast?.show) return null;

  return (
    <div className={`session-toast ${toast.type === "error" ? "error" : ""}`}>
      <span className="session-toast-icon">
        {toast.type === "error" ? "✕" : "✓"}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}

export default function InterviewSession() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [companyFilter, setCompanyFilter] = useState("");
  const [expiredFilter, setExpiredFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [connectItem, setConnectItem] = useState(null);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const toastTimerRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: true,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, companyFilter, expiredFilter, sort]);

  const {
    data: allSessions = [],
    isLoading: loading,
    isFetching,
  } = useQuery({
    queryKey: SESSIONS_ALL_QUERY_KEY,
    queryFn: () => fetchAllSessions(),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const refreshSessions = useCallback(async () => {
    const freshSessions = await fetchAllSessions({ forceFresh: true });

    queryClient.setQueryData(SESSIONS_ALL_QUERY_KEY, freshSessions);

    return freshSessions;
  }, [queryClient]);

  const refreshSessionsInBackground = useCallback(() => {
    refreshSessions().catch((error) => {
      console.error("Failed to refresh sessions:", error);
    });
  }, [refreshSessions]);

  useEffect(() => {
    const handleSessionUpdated = (event) => {
      const changedSession = event?.detail?.session || null;

      if (changedSession) {
        const normalizedSession = normalizeSession(changedSession);

        if (normalizedSession.id) {
          queryClient.setQueryData(SESSIONS_ALL_QUERY_KEY, (oldSessions = []) => {
            const safeSessions = Array.isArray(oldSessions) ? oldSessions : [];
            const alreadyExists = safeSessions.some(
              (session) => session.id === normalizedSession.id
            );

            if (alreadyExists) {
              return safeSessions.map((session) =>
                session.id === normalizedSession.id ? normalizedSession : session
              );
            }

            return [normalizedSession, ...safeSessions];
          });

          setPage(1);
          return;
        }
      }

      refreshSessionsInBackground();
    };

    window.addEventListener("session-updated", handleSessionUpdated);

    return () => {
      window.removeEventListener("session-updated", handleSessionUpdated);
    };
  }, [queryClient, refreshSessionsInBackground]);

  const companies = useMemo(() => {
    return Array.from(
      new Set(allSessions.map((item) => item.company).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [allSessions]);

  const filteredRows = useMemo(() => {
    const search = debouncedQuery.toLowerCase();

    const rows = allSessions.filter((item) => {
      const company = item.company.toLowerCase();
      const position = item.position.toLowerCase();

      const matchesSearch =
        !search || company.includes(search) || position.includes(search);

      const matchesCompany = !companyFilter || item.company === companyFilter;

      const matchesStatus =
        expiredFilter === "all" || item.status === expiredFilter;

      return matchesSearch && matchesCompany && matchesStatus;
    });

    rows.sort((a, b) => {
      const firstDate = getDateTime(a.createdAt);
      const secondDate = getDateTime(b.createdAt);

      return sort === "newest"
        ? secondDate - firstDate
        : firstDate - secondDate;
    });

    return rows;
  }, [allSessions, debouncedQuery, companyFilter, expiredFilter, sort]);

  const totalRecords = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const data = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const deleteMutation = useMutation({
    mutationFn: (id) => sessionService.deleteSession(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: SESSIONS_ALL_QUERY_KEY,
        exact: true,
      });

      const previousSessions = queryClient.getQueryData(SESSIONS_ALL_QUERY_KEY);

      queryClient.setQueryData(SESSIONS_ALL_QUERY_KEY, (oldSessions = []) => {
        if (!Array.isArray(oldSessions)) return oldSessions;

        return oldSessions.filter((session) => session.id !== id);
      });

      return { previousSessions };
    },

    onSuccess: () => {
      showToast("Interview deleted successfully.");
    },

    onError: (error, _id, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          SESSIONS_ALL_QUERY_KEY,
          context.previousSessions
        );
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete interview.";

      showToast(message, "error");
    },

    onSettled: () => {
      refreshSessionsInBackground();
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (row) => sessionService.duplicateSession(row.id),

    onMutate: async (row) => {
      await queryClient.cancelQueries({
        queryKey: SESSIONS_ALL_QUERY_KEY,
        exact: true,
      });

      const previousSessions = queryClient.getQueryData(SESSIONS_ALL_QUERY_KEY);

      const now = new Date().toISOString();
      const tempId = `temp-duplicate-${row.id}-${Date.now()}`;

      const optimisticRaw = {
        ...(row.raw || {}),
        _id: tempId,
        id: tempId,
        title: `${row.raw?.title || "Session"} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };

      const optimisticSession = normalizeSession(optimisticRaw);

      queryClient.setQueryData(SESSIONS_ALL_QUERY_KEY, (oldSessions = []) => {
        if (!Array.isArray(oldSessions)) return oldSessions;

        return [optimisticSession, ...oldSessions];
      });

      return {
        previousSessions,
        tempId,
      };
    },

    onSuccess: (response, _row, context) => {
      const createdSession = extractSingleSession(response);

      if (createdSession && context?.tempId) {
        const normalizedSession = normalizeSession(createdSession);

        queryClient.setQueryData(SESSIONS_ALL_QUERY_KEY, (oldSessions = []) => {
          if (!Array.isArray(oldSessions)) return oldSessions;

          return oldSessions.map((session) =>
            session.id === context.tempId ? normalizedSession : session
          );
        });
      }

      showToast("Interview duplicated successfully.");

      if (createdSession) {
        window.dispatchEvent(
          new CustomEvent("session-updated", {
            detail: {
              type: "duplicated",
              session: createdSession,
            },
          })
        );
      }
    },

    onError: (error, _row, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          SESSIONS_ALL_QUERY_KEY,
          context.previousSessions
        );
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to duplicate interview.";

      showToast(message, "error");
    },

    onSettled: () => {
      refreshSessionsInBackground();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => sessionService.updateSession(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({
        queryKey: SESSIONS_ALL_QUERY_KEY,
        exact: true,
      });

      const previousSessions = queryClient.getQueryData(SESSIONS_ALL_QUERY_KEY);

      queryClient.setQueryData(SESSIONS_ALL_QUERY_KEY, (oldSessions = []) => {
        if (!Array.isArray(oldSessions)) return oldSessions;

        return oldSessions.map((session) => {
          if (session.id !== id) return session;

          const optimisticRaw = {
            ...(session.raw || {}),
            ...payload,
            _id: id,
            id,
            updatedAt: new Date().toISOString(),
          };

          return normalizeSession(optimisticRaw);
        });
      });

      return { previousSessions };
    },

    onSuccess: (response) => {
      const updatedSession = extractSingleSession(response) || response;

      if (updatedSession) {
        const normalizedSession = normalizeSession(updatedSession);

        queryClient.setQueryData(SESSIONS_ALL_QUERY_KEY, (oldSessions = []) => {
          if (!Array.isArray(oldSessions)) return oldSessions;

          return oldSessions.map((session) =>
            session.id === normalizedSession.id ? normalizedSession : session
          );
        });
      }

      showToast("Interview updated successfully.");
    },

    onError: (error, _variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(
          SESSIONS_ALL_QUERY_KEY,
          context.previousSessions
        );
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update interview.";

      showToast(message, "error");
    },

    onSettled: () => {
      refreshSessionsInBackground();
    },
  });

  const connectMutation = useMutation({
    mutationFn: ({ id, payload }) => sessionService.connectSession(id, payload),
  });

  const deleting = deleteMutation.isPending || deleteMutation.isLoading;
  const duplicating = duplicateMutation.isPending || duplicateMutation.isLoading;

  function handleDelete(id) {
    setConfirm({ open: true, id });
  }

  function confirmDelete() {
    if (!confirm.id || deleting) return;

    const idToDelete = confirm.id;

    setConfirm({ open: false, id: null });
    deleteMutation.mutate(idToDelete);
  }

  async function handleView(row) {
    try {
      let full = row.raw || null;

      if (!full || !full._id) {
        full = await sessionService.getSession(row.id, { forceFresh: true });
      }

      setViewItem(full);
    } catch (error) {
      console.error("Failed to load session for view:", error);
      showToast("Failed to load interview details.", "error");
    }
  }

  async function handleEdit(row) {
    try {
      let full = row.raw || null;

      if (!full || !full._id) {
        full = await sessionService.getSession(row.id, { forceFresh: true });
      }

      setEditItem(full);
    } catch (error) {
      console.error("Failed to load session for edit:", error);
      showToast("Failed to load interview for edit.", "error");
    }
  }

  function handleStart(row) {
    setConnectItem(row);
    setIsConnectOpen(true);
  }

  function handleDuplicate(row) {
    if (duplicating) return;

    duplicateMutation.mutate(row);
  }

 async function handleConnectActivate({
  shareAudio,
  connectionMethod,
  meetingLink,
}) {
  if (!connectItem) {
    return { blocked: true, reason: "missing-session" };
  }

  try {
    const response = await connectMutation.mutateAsync({
      id: connectItem.id,
      payload: {
        shareAudio,
        connectionMethod,
        meetingLink,
        language: connectItem.raw?.language,
        aiModel: connectItem.raw?.aiModel,
      },
    });

    if (!response || !response.session) {
      console.warn("Connect response missing session, returning safe fallback");

      showToast("Unable to start interview session. Please try again.", "error");

      return {
        blocked: true,
        reason: "missing-response",
      };
    }

    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    refreshSessionsInBackground();

    return {
      session: response.session,
      user: response.user || null,
    };
  } catch (error) {
    console.error("Connect failed:", error);

    const rawMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to activate interview.";

    const lowerMessage = String(rawMessage).toLowerCase();

    const isCreditError =
      lowerMessage.includes("insufficient") ||
      lowerMessage.includes("credit") ||
      lowerMessage.includes("not enough") ||
      lowerMessage.includes("balance");

    const message = isCreditError
      ? "Please buy credits first to start your interview."
      : rawMessage;

    showToast(message, "error");

    if (isCreditError) {
      setTimeout(() => {
        setIsConnectOpen(false);
        setConnectItem(null);
        navigate("/buy-credits");
      }, 1200);

      return {
        blocked: true,
        reason: "credits",
      };
    }

    return {
      blocked: true,
      reason: "error",
    };
  }
}

  function getDefaultUrl(method) {
    switch (method) {
      case "zoom":
        return "https://zoom.us/";
      case "meet":
        return "https://meet.google.com/";
      case "teams":
        return "https://teams.microsoft.com/";
      case "whatsapp":
        return "https://web.whatsapp.com/";
      default:
        return "/";
    }
  }

  const startRecord = totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const endRecord = Math.min(page * PAGE_SIZE, totalRecords);

  if (loading && !allSessions.length) {
    return (
      <div className="relative flex h-[60vh] items-center justify-center">
        <AILoader text="Loading Interviews..." />
      </div>
    );
  }

  return (
    <>
      <SessionToast toast={toast} />

      <div className="content interview-page">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search className="search-icon" />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="search-input"
              placeholder="Search company or position..."
            />
          </div>

          <div className="select-wrap">
            <select
              value={companyFilter}
              onChange={(event) => setCompanyFilter(event.target.value)}
              className="filter-select"
            >
              <option value="">All Companies</option>

              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>

            <ChevronDown className="select-chevron" />
          </div>

          <div className="select-wrap">
            <select
              value={expiredFilter}
              onChange={(event) => setExpiredFilter(event.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            <ChevronDown className="select-chevron" />
          </div>

          <div className="ml-auto">
            <button
              type="button"
              onClick={() =>
                setSort((current) =>
                  current === "newest" ? "oldest" : "newest"
                )
              }
              className="sort-btn"
            >
              <span>{sort === "newest" ? "Newest" : "Oldest"}</span>
              <ChevronDown />
            </button>
          </div>
        </div>

        <div className="table-card">
          <table className="session-table">
            <thead>
              <tr>
                <th className="col-sno">S.No</th>
                <th>Company</th>
                <th>Position</th>
                <th>Ends In</th>
                <th>Created At</th>
                <th>AI Usage</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => {
                const serialNo = (page - 1) * PAGE_SIZE + index + 1;
                const isExpired = row.status === "expired";

                return (
                  <tr key={row.id}>
                    <td className="col-sno">{serialNo}</td>

                    <td className="col-company">{row.company || "—"}</td>

                    <td className="col-pos">{row.position || "—"}</td>

                    <td>
                      <div className="status-cell">
                        <span
                          className={`badge ${
                            isExpired ? "badge-expired" : "badge-active"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>

                        <span className="credits-txt">
                          {row.credits} credits
                        </span>
                      </div>
                    </td>

                    <td className="col-date">{formatDate(row.createdAt)}</td>

                    <td className="col-usage">{row.aiUsage}</td>

                    <td>
                      <div className="action-cell">
                        <button
                          type="button"
                          className="action-btn"
                          title="View session"
                          aria-label="View session"
                          onClick={() => handleView(row)}
                        >
                          <Eye />
                        </button>

                        <button
                          type="button"
                          className="action-btn"
                          title="Start session"
                          aria-label="Start session"
                          onClick={() => handleStart(row)}
                        >
                          <Play />
                        </button>

                        <button
                          type="button"
                          className="action-btn"
                          title="Duplicate session"
                          aria-label="Duplicate session"
                          disabled={duplicating}
                          onClick={() => handleDuplicate(row)}
                        >
                          <Copy />
                        </button>

                        <button
                          type="button"
                          className="action-btn"
                          title="Edit session"
                          aria-label="Edit session"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit2 />
                        </button>

                        <button
                          type="button"
                          className="action-btn del"
                          title="Delete session"
                          aria-label="Delete session"
                          disabled={deleting}
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {data.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <div className="showing-text">
              Showing {startRecord} – {endRecord} of {totalRecords} Sessions
            </div>

            <div className="pagination">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="page-btn"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`page-btn ${
                      pageNumber === page ? "active" : ""
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="page-btn"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <SessionEditModal
        key={editItem?._id || editItem?.id}
        open={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSave={async (payload) => {
          const id = editItem._id || editItem.id;
          await updateMutation.mutateAsync({ id, payload });
          setEditItem(null);
        }}
      />

      <SessionViewModal
        key={viewItem?._id || viewItem?.id}
        open={!!viewItem}
        item={viewItem}
        onClose={() => setViewItem(null)}
      />

      <ConnectModal
        isOpen={isConnectOpen}
        onClose={() => {
          setIsConnectOpen(false);
          setConnectItem(null);
        }}
        onBack={() => setIsConnectOpen(false)}
        language={connectItem?.raw?.language || "English"}
        aiModel={connectItem?.raw?.aiModel || "GPT-4.1 (Smarter)"}
        company={connectItem?.raw?.company}
        position={connectItem?.raw?.position}
        onActivate={handleConnectActivate}
      />

      <Confirm
        open={confirm.open}
        onCancel={() => setConfirm({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete interview"
        message="Are you sure you want to delete this interview? This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        disabled={deleting}
      />
    </>
  );
}