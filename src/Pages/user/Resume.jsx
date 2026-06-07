import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Search,
  Trash2,
  X,
} from "lucide-react";

import AILoader from "../../Components/AILoader";
import ViewModal from "../../Components/ViewModal";
import {
  deleteResumeService,
  getResumesService,
} from "../../Services/resume.service";
import { fetchSignedResumeUrl, resolveApiUrl } from "../../utils/apiUrl";

const PAGE_SIZE = 5;
const ALL_RESUMES_LIMIT = 1000;
const RESUMES_ALL_QUERY_KEY = ["resumes", "all"];

function formatDate(dateObj) {
  if (!dateObj) return "N/A";

  try {
    const date =
      typeof dateObj === "object" && dateObj._seconds
        ? new Date(dateObj._seconds * 1000)
        : new Date(dateObj);

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

function getTimestampMs(dateObj) {
  if (!dateObj) return 0;

  try {
    if (typeof dateObj === "object" && dateObj._seconds) {
      return dateObj._seconds * 1000;
    }

    const time = new Date(dateObj).getTime();
    return Number.isNaN(time) ? 0 : time;
  } catch {
    return 0;
  }
}

function extractResumeRows(response) {
  const payload = response?.data || response;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.resumes)) return payload.resumes;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
}

function extractResumeMeta(response, fallbackRowsLength = 0) {
  const payload = response?.data || response;

  const total =
    Number(payload?.total) ||
    Number(payload?.count) ||
    Number(payload?.totalCount) ||
    fallbackRowsLength;

  const totalPages =
    Number(payload?.totalPages) ||
    Math.ceil(total / ALL_RESUMES_LIMIT) ||
    1;

  return {
    total,
    totalPages,
  };
}

function normalizeResume(resume) {
  const id = (resume?._id || resume?.id || "").toString();

  return {
    id,
    title: resume?.title || resume?.fileName || resume?.name || "Untitled Resume",
    createdAt: resume?.createdAt || resume?.uploadedAt || resume?.updatedAt,
    resumeUrl: resume?.resumeUrl || resume?.url || "",
    previewUrl: resume?.previewUrl || "",
    downloadUrl: resume?.downloadUrl || "",
    textUrl: resume?.textUrl || "",
    jsonUrl: resume?.jsonUrl || "",
    parsedData: resume?.parsedData || resume?.json || null,
    raw: resume,
  };
}

async function fetchAllResumes() {
  const firstResponse = await getResumesService(1, ALL_RESUMES_LIMIT);
  const firstRows = extractResumeRows(firstResponse);
  const meta = extractResumeMeta(firstResponse, firstRows.length);

  let allRows = [...firstRows];

  if (meta.totalPages > 1) {
    const remainingPages = Array.from(
      { length: meta.totalPages - 1 },
      (_, index) => index + 2
    );

    const remainingResponses = await Promise.all(
      remainingPages.map((pageNumber) =>
        getResumesService(pageNumber, ALL_RESUMES_LIMIT).catch(() => null)
      )
    );

    remainingResponses.forEach((response) => {
      allRows = [...allRows, ...extractResumeRows(response)];
    });
  }

  const uniqueMap = new Map();

  allRows.forEach((resume) => {
    const normalized = normalizeResume(resume);

    if (normalized.id) {
      uniqueMap.set(normalized.id, normalized);
    }
  });

  return Array.from(uniqueMap.values());
}

function ResumeToast({ toast }) {
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
        aria-labelledby="resume-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-close-btn"
          onClick={onCancel}
          disabled={disabled}
          aria-label="Close confirmation modal"
        >
          <X />
        </button>

        <div className="confirm-modal-body">
          <div className="confirm-icon-wrap">
            <AlertTriangle />
          </div>

          <h3 id="resume-confirm-title" className="confirm-modal-title">
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


export default function Resume() {
  const queryClient = useQueryClient();
  const toastTimerRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState({});
  const [viewItem, setViewItem] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    ids: [],
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

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
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, sortOrder]);

  const {
    data: allResumes = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: RESUMES_ALL_QUERY_KEY,
    queryFn: fetchAllResumes,
    keepPreviousData: true,
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const refreshResumes = async () => {
    const freshResumes = await fetchAllResumes();
    queryClient.setQueryData(RESUMES_ALL_QUERY_KEY, freshResumes);
    return freshResumes;
  };

  const refreshResumesInBackground = () => {
    refreshResumes().catch((error) => {
      console.error("Failed to refresh resumes:", error);
    });
  };

  useEffect(() => {
    const handleResumeUpdate = () => {
      refreshResumesInBackground();
    };

    window.addEventListener("resume-updated", handleResumeUpdate);

    return () => {
      window.removeEventListener("resume-updated", handleResumeUpdate);
    };
  }, []);

  const filteredRows = useMemo(() => {
    const query = debouncedQuery.toLowerCase();

    const rows = allResumes.filter((resume) => {
      const title = resume.title.toLowerCase();
      return !query || title.includes(query);
    });

    rows.sort((a, b) => {
      const firstDate = getTimestampMs(a.createdAt);
      const secondDate = getTimestampMs(b.createdAt);

      return sortOrder === "newest"
        ? secondDate - firstDate
        : firstDate - secondDate;
    });

    return rows;
  }, [allResumes, debouncedQuery, sortOrder]);

  const totalRecords = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const selectedCount = Object.keys(selected).length;

  const isAllSelected =
    pageItems.length > 0 && pageItems.every((item) => selected[item.id]);

  const startRecord = totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAGE_SIZE, totalRecords);

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedQuery("");
  };

  const toggleSort = () => {
    setSortOrder((current) => (current === "newest" ? "oldest" : "newest"));
  };

  const toggleSelect = (id) => {
    setSelected((previous) => {
      const next = { ...previous };

      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }

      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((previous) => {
      const next = { ...previous };

      if (isAllSelected) {
        pageItems.forEach((item) => {
          delete next[item.id];
        });
      } else {
        pageItems.forEach((item) => {
          next[item.id] = true;
        });
      }

      return next;
    });
  };

  const closeConfirm = () => {
    setConfirmConfig({
      open: false,
      title: "",
      message: "",
      ids: [],
    });
  };

  const openView = (row) => {
    setViewItem(row);
  };

  const closeView = () => {
    setViewItem(null);
  };

  const requestDelete = (row) => {
    setConfirmConfig({
      open: true,
      title: "Delete Resume",
      message: `Are you sure you want to delete "${row?.title || "this resume"}"? This action cannot be undone.`,
      ids: [row.id],
    });
  };

  const requestDeleteSelected = () => {
    const ids = Object.keys(selected);

    if (!ids.length) return;

    setConfirmConfig({
      open: true,
      title: "Delete Selected Resumes",
      message: `Are you sure you want to delete ${ids.length} selected resume(s)? This action cannot be undone.`,
      ids,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      if (ids.length === 1) {
        return deleteResumeService(ids[0]);
      }

      return Promise.all(ids.map((id) => deleteResumeService(id)));
    },

    onMutate: async (ids) => {
      await queryClient.cancelQueries({
        queryKey: RESUMES_ALL_QUERY_KEY,
        exact: true,
      });

      const previousResumes = queryClient.getQueryData(RESUMES_ALL_QUERY_KEY);

      queryClient.setQueryData(RESUMES_ALL_QUERY_KEY, (oldResumes = []) => {
        if (!Array.isArray(oldResumes)) return oldResumes;

        return oldResumes.filter((resume) => !ids.includes(resume.id));
      });

      setSelected((previous) => {
        const next = { ...previous };

        ids.forEach((id) => {
          delete next[id];
        });

        return next;
      });

      return { previousResumes };
    },

    onSuccess: (_response, ids) => {
      showToast(
        ids.length === 1
          ? "Resume deleted successfully."
          : "Selected resumes deleted successfully."
      );
      closeConfirm();
      window.dispatchEvent(new Event("resume-updated"));
    },

    onError: (error, _ids, context) => {
      if (context?.previousResumes) {
        queryClient.setQueryData(
          RESUMES_ALL_QUERY_KEY,
          context.previousResumes
        );
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete resume.";

      showToast(message, "error");
      closeConfirm();
    },

    onSettled: () => {
      refreshResumesInBackground();
    },
  });

  const deleting = deleteMutation.isPending || deleteMutation.isLoading;

  const confirmDelete = () => {
    if (!confirmConfig.ids.length || deleting) return;

    deleteMutation.mutate(confirmConfig.ids);
  };

  const handleDownload = async (row) => {
    try {
      if (!row?.downloadUrl && row?.resumeUrl) {
        const data = await fetchSignedResumeUrl(row.resumeUrl);
        if (data.url) {
          window.open(resolveApiUrl(data.url), "_blank");
        }
        return;
      }

      if (!row?.downloadUrl) {
        showToast("Download link is not available.", "error");
        return;
      }

      const data = await fetchSignedResumeUrl(row.downloadUrl);

      if (data.url) {
        window.open(resolveApiUrl(data.url), "_blank");
        return;
      }

      const blob = await data.response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = row.title || "resume";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      showToast(error?.message || "Download failed. Please try again.", "error");
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];

    for (let index = 1; index <= totalPages; index += 1) {
      buttons.push(
        <button
          key={index}
          type="button"
          onClick={() => setPage(index)}
          className={`page-btn ${index === page ? "active" : ""}`}
          aria-label={`Go to page ${index}`}
        >
          {index}
        </button>
      );
    }

    return buttons;
  };

  if (isLoading && !allResumes.length) {
    return (
      <div className="relative flex h-[60vh] items-center justify-center">
        <AILoader text="Loading Resumes..." />
      </div>
    );
  }

  return (
    <>
      <ResumeToast toast={toast} />

      <div className="content interview-page resume-page">
        <div className="filter-bar">
          <div className="search-wrap">
            <Search className="search-icon" />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="search-input"
              placeholder="Search resumes..."
            />
          </div>

          <button type="button" onClick={clearSearch} className="btn-outline">
            Clear
          </button>

          <div className="ml-auto">
            <button type="button" onClick={toggleSort} className="sort-btn">
              <span>{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
              <ChevronDown />
            </button>
          </div>
        </div>

        {isFetching && allResumes.length > 0 && (
          <div className="session-refresh-text">Refreshing resumes...</div>
        )}

        {selectedCount > 0 && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-700">
                {selectedCount} resume{selectedCount > 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-red-500">
                You can delete all selected resumes at once.
              </p>
            </div>

            <button
              type="button"
              onClick={requestDeleteSelected}
              className="btn-confirm-danger"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
          </div>
        )}

        <div className="table-card">
          <table className="session-table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer accent-emerald-500"
                    aria-label="Select all resumes on this page"
                  />
                </th>
                <th className="col-sno">S.No</th>
                <th>Title</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    No resumes found.
                  </td>
                </tr>
              ) : (
                pageItems.map((row, index) => {
                  const serial = (page - 1) * PAGE_SIZE + index + 1;
                  const isChecked = Boolean(selected[row.id]);

                  return (
                    <tr key={row.id} className={isChecked ? "bg-emerald-50/60" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(row.id)}
                          className="h-4 w-4 cursor-pointer accent-emerald-500"
                          aria-label={`Select ${row.title}`}
                        />
                      </td>

                      <td className="col-sno">{serial}</td>

                      <td>
                        <div className="flex min-w-64 items-center gap-3">
                          <div className="edit-resume-file-icon">
                            <FileText />
                          </div>

                          <div className="min-w-0">
                            <div
                              className="truncate text-sm font-semibold"
                              style={{ color: "var(--session-text-dark)" }}
                            >
                              {row.title}
                            </div>

                            <div
                              className="mt-0.5 text-xs"
                              style={{ color: "var(--session-text-light)" }}
                            >
                              Resume file
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="col-date">{formatDate(row.createdAt)}</td>

                      <td>
                        <div className="action-cell">
                          <button
                            type="button"
                            onClick={() => openView(row)}
                            className="action-btn"
                            title="View"
                            aria-label={`View ${row.title}`}
                          >
                            <Eye />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(row)}
                            className="action-btn"
                            title="Download"
                            aria-label={`Download ${row.title}`}
                            disabled={!row.downloadUrl && !row.resumeUrl}
                          >
                            <Download />
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDelete(row)}
                            className="action-btn del"
                            title="Delete"
                            aria-label={`Delete ${row.title}`}
                            disabled={deleting}
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <div className="showing-text">
              {totalRecords === 0
                ? "No results"
                : `Showing ${startRecord}–${endRecord} of ${totalRecords} Resumes`}
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

              {renderPaginationButtons()}

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

        <ViewModal
  key={viewItem?.id || viewItem?._id || "resume-view"}
  open={Boolean(viewItem)}
  item={viewItem}
  onClose={closeView}
  onDownload={handleDownload}
/>

        <Confirm
          open={confirmConfig.open}
          onCancel={closeConfirm}
          onConfirm={confirmDelete}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          disabled={deleting}
        />
      </div>
    </>
  );
}
