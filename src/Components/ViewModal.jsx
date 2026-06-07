import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Github,
  Globe2,
  GraduationCap,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { getPreviewSrc } from "../utils/getPreviewSrc";
import { fetchSignedResumeUrl, resolveApiUrl } from "../utils/apiUrl";

const formatDate = (dateObj) => {
  if (!dateObj) return "N/A";

  try {
    const date =
      typeof dateObj === "object" && dateObj._seconds
        ? new Date(dateObj._seconds * 1000)
        : new Date(dateObj);

    if (Number.isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const normalizeArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getTextValue = (...values) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== ""
  );

  return value ? String(value).trim() : "";
};

const getPreviewLink = (item) => {
  return (
    item?.previewUrl ||
    item?.resumePreviewUrl ||
    item?.resumeUrl ||
    item?.textUrl ||
    item?.jsonUrl ||
    ""
  );
};

const getDownloadLink = (item) => {
  return (
    item?.downloadUrl ||
    item?.resumeDownloadUrl ||
    item?.resumeUrl ||
    item?.previewUrl ||
    ""
  );
};

const getDescriptionList = (description) => {
  if (!description) return [];

  if (Array.isArray(description)) {
    return description.filter(Boolean);
  }

  if (typeof description === "string") {
    return description
      .split(/\n|•/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

function EmptyState({ message = "No data available." }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--session-border)] bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
      {message}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-[var(--session-border)] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-brand-subtle)]">
          <Icon className="h-4 w-4 text-brand" />
        </span>

        <h4 className="text-base font-bold text-slate-900">{title}</h4>
      </div>

      {children}
    </section>
  );
}

function InfoLine({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="shrink-0 font-semibold text-slate-700">{label}:</span>
      <span className="min-w-0 truncate">{value}</span>
    </div>
  );
}

function LinkButton({ href, icon: Icon, label }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border-2 border-[var(--session-border)] bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-[var(--color-brand)] hover:text-brand"
    >
      <Icon className="h-4 w-4" />
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function TagList({ items }) {
  const list = normalizeArray(items);

  if (!list.length) return <EmptyState message="No skills found." />;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item, index) => (
        <span
          key={`${String(item)}-${index}`}
          className="rounded-full bg-[var(--color-brand-subtle)] px-3 py-1.5 text-xs font-bold text-brand"
        >
          {typeof item === "string" ? item : item?.title || item?.name}
        </span>
      ))}
    </div>
  );
}

function SimpleList({ items, emptyMessage }) {
  const list = normalizeArray(items);

  if (!list.length) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="space-y-2">
      {list.map((item, index) => {
        const text =
          typeof item === "string"
            ? item
            : item?.title || item?.name || item?.description || "";

        if (!text) return null;

        return (
          <li
            key={`${text}-${index}`}
            className="flex gap-2 text-sm leading-6 text-slate-600"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand" />
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}

function TimelineCard({
  title,
  subtitle,
  period,
  description,
  technologies,
  links,
}) {
  const descriptionList = getDescriptionList(description);
  const techList = normalizeArray(technologies);
  const linkList = normalizeArray(links);

  return (
    <div className="rounded-2xl border border-[var(--session-border)] bg-slate-50 p-4 transition-colors hover:bg-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-slate-900">
            {title || "Untitled"}
          </p>

          {subtitle && (
            <p className="mt-1 text-sm font-medium text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {period && (
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
            {period}
          </span>
        )}
      </div>

      {descriptionList.length > 0 && (
        <ul className="mt-3 space-y-2">
          {descriptionList.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-2 text-sm leading-6 text-slate-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {techList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {techList.map((tech, index) => (
            <span
              key={`${tech}-${index}`}
              className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {linkList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {linkList.map((link, index) => (
            <a
              key={`${link}-${index}`}
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-brand hover:text-brand-hover"
            >
              Link {index + 1}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ViewModal({ open, item, onClose, onDownload }) {
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const parsedData = item?.parsedData || item?.json || {};
  const contact = parsedData?.contact || parsedData?.personalInfo || {};

  const candidateName = getTextValue(
    contact.name,
    contact.fullName,
    parsedData.name,
    item?.title
  );

  const candidateEmail = getTextValue(contact.email, parsedData.email);
  const candidatePhone = getTextValue(contact.phone, parsedData.phone);
  const candidateLocation = getTextValue(
    contact.location,
    contact.address,
    parsedData.location
  );

  const profileSummary = getTextValue(
    parsedData.profile_summary,
    parsedData.profileSummary,
    parsedData.summary,
    parsedData.objective
  );

  const linkedin = getTextValue(contact.linkedin, parsedData.linkedin);
  const github = getTextValue(contact.github, parsedData.github);
  const website = getTextValue(
    contact.website,
    contact.portfolio,
    parsedData.website,
    parsedData.portfolio
  );

  const skills = useMemo(
    () =>
      normalizeArray(
        parsedData.skills ||
          parsedData.technical_skills ||
          parsedData.technicalSkills
      ),
    [parsedData.skills, parsedData.technical_skills, parsedData.technicalSkills]
  );

  const capabilities = useMemo(
    () => normalizeArray(parsedData.capabilities || parsedData.coreCapabilities),
    [parsedData.capabilities, parsedData.coreCapabilities]
  );

  const experience = normalizeArray(
    parsedData.experience || parsedData.workExperience
  );

  const projects = normalizeArray(parsedData.projects);
  const education = normalizeArray(parsedData.education);
  const certifications = normalizeArray(parsedData.certifications);
  const achievements = normalizeArray(parsedData.achievements);
  const languages = normalizeArray(parsedData.languages);
  const interests = normalizeArray(parsedData.interests);

  const previewLink = getPreviewLink(item);
  const downloadLink = getDownloadLink(item);
  const uploadedDate = formatDate(
    item?.createdAt || item?.uploadedAt || item?.updatedAt
  );

  const totalSections =
    Number(Boolean(profileSummary)) +
    Number(capabilities.length > 0) +
    Number(skills.length > 0) +
    Number(experience.length > 0) +
    Number(projects.length > 0) +
    Number(education.length > 0) +
    Number(certifications.length > 0) +
    Number(achievements.length > 0) +
    Number(languages.length > 0) +
    Number(interests.length > 0);

  useEffect(() => {
    if (!open) return undefined;
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const scrollContainers = [
      root,
      document.querySelector("main"),
      document.querySelector(".content"),
      document.querySelector(".interview-page"),
      document.querySelector(".main-content"),
      document.querySelector(".layout-content"),
    ].filter(Boolean);

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlHeight = html.style.height;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyRight = body.style.right;
    const previousBodyWidth = body.style.width;

    const previousContainers = scrollContainers.map((element) => ({
      element,
      overflow: element.style.overflow,
      overflowY: element.style.overflowY,
    }));

    html.style.overflow = "hidden";
    html.style.height = "100%";

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    scrollContainers.forEach((element) => {
      element.style.overflow = "hidden";
      element.style.overflowY = "hidden";
    });

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.height = previousHtmlHeight;

      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.right = previousBodyRight;
      body.style.width = previousBodyWidth;

      previousContainers.forEach(({ element, overflow, overflowY }) => {
        element.style.overflow = overflow;
        element.style.overflowY = overflowY;
      });

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useEffect(() => {
    setPreviewSrc("");
    setPreviewError("");

    if (!open || !previewLink) return undefined;

    let mounted = true;

    const loadPreview = async () => {
      try {
        setPreviewLoading(true);

        const signedUrl = await getPreviewSrc(previewLink);

        if (!mounted) return;

        if (signedUrl) {
          setPreviewSrc(signedUrl);
          setPreviewError("");
        } else {
          setPreviewError("Preview is not available for this resume.");
        }
      } catch (error) {
        console.error("Preview load failed:", error);

        if (mounted) {
          setPreviewError("Preview failed to load.");
        }
      } finally {
        if (mounted) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      mounted = false;
    };
  }, [
    open,
    previewLink,
    item?.id,
    item?._id,
    item?.previewUrl,
    item?.resumePreviewUrl,
    item?.resumeUrl,
    item?.textUrl,
    item?.jsonUrl,
  ]);

  if (!open || !item) return null;

  const portalTarget =
    typeof document !== "undefined" && document.body ? document.body : null;

  if (!portalTarget) return null;

  const handleClose = () => {
    onClose?.();
  };

  const handleDownload = async () => {
    if (typeof onDownload === "function") {
      onDownload(item);
      return;
    }

    try {
      if (!downloadLink) return;

      const data = await fetchSignedResumeUrl(downloadLink);

      if (data.url) {
        window.open(resolveApiUrl(data.url), "_blank", "noopener,noreferrer");
        return;
      }

      const blob = await data.response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = item.title || "resume";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex h-[100dvh] items-center justify-center overflow-hidden p-2 animate-fadeIn sm:p-4">
      <button
        type="button"
        aria-label="Close resume view modal"
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <section
        className="relative z-[1000000] flex h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-view-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-lg border-0 bg-white/90 text-slate-400 shadow-sm transition-colors hover:text-slate-900 sm:right-4 sm:top-4"
          aria-label="Close resume view modal"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="relative shrink-0 overflow-hidden border-b border-[var(--session-border)] bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-4 sm:px-6 sm:py-5">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--color-brand-subtle)] blur-2xl sm:h-32 sm:w-32" />
          <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-sky-100 blur-2xl sm:h-28 sm:w-28" />

          <div className="relative flex min-w-0 items-start gap-3 pr-10">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-sm sm:h-12 sm:w-12">
              <FileText className="h-5 w-5 text-brand sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 sm:px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" />
                  Resume Preview
                </span>

              </div>

              <h2
                id="resume-view-title"
                className="truncate pr-1 text-lg font-bold text-slate-900 sm:text-2xl"
              >
                {candidateName || item.title || "Resume"}
              </h2>

              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">Uploaded {uploadedDate}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="view-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-4 lg:sticky lg:top-0 lg:self-start">
              <div className="rounded-2xl border border-[var(--session-border)] bg-white p-4 shadow-sm">
                <div className="mb-4 flex min-w-0 items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--color-brand-subtle)]">
                    <User className="h-6 w-6 text-brand" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {candidateName || item.title || "Resume"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Candidate details
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <InfoLine icon={Mail} label="Email" value={candidateEmail} />
                  <InfoLine icon={Phone} label="Phone" value={candidatePhone} />
                  <InfoLine
                    icon={MapPin}
                    label="Location"
                    value={candidateLocation}
                  />
                  <InfoLine icon={FileText} label="File" value={item.title} />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!downloadLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Download Resume
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--session-border)] bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-[var(--color-brand)] hover:text-brand"
                  >
                    Close
                  </button>
                </div>
              </div>

              {(linkedin || github || website) && (
                <div className="rounded-2xl border border-[var(--session-border)] bg-white p-4 shadow-sm">
                  <h4 className="mb-3 text-sm font-bold text-slate-900">
                    Profile Links
                  </h4>

                  <div className="flex flex-col gap-2">
                    <LinkButton href={linkedin} icon={Link2} label="LinkedIn" />
                    <LinkButton href={github} icon={Github} label="GitHub" />
                    <LinkButton href={website} icon={Globe2} label="Portfolio" />
                  </div>
                </div>
              )}
            </aside>

            <main className="min-w-0 space-y-5">
              {profileSummary && (
                <Section icon={Sparkles} title="Profile Summary">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {profileSummary}
                  </p>
                </Section>
              )}

              {capabilities.length > 0 && (
                <Section icon={CheckCircle2} title="Core Capabilities">
                  <TagList items={capabilities} />
                </Section>
              )}

              <Section icon={Sparkles} title="Skills">
                <TagList items={skills} />
              </Section>

              {experience.length > 0 && (
                <Section icon={Briefcase} title="Experience">
                  <div className="space-y-3">
                    {experience.map((exp, index) => {
                      const title = getTextValue(
                        exp.title,
                        exp.role,
                        exp.position,
                        exp.designation
                      );

                      const subtitle = getTextValue(
                        exp.company,
                        exp.organization,
                        exp.employer
                      );

                      const period = getTextValue(
                        exp.duration,
                        [exp.start_date, exp.end_date]
                          .filter(Boolean)
                          .join(" - "),
                        [exp.startDate, exp.endDate].filter(Boolean).join(" - ")
                      );

                      return (
                        <TimelineCard
                          key={`${title}-${index}`}
                          title={title}
                          subtitle={subtitle}
                          period={period}
                          description={exp.description || exp.responsibilities}
                          technologies={exp.technologies || exp.skills}
                        />
                      );
                    })}
                  </div>
                </Section>
              )}

              {projects.length > 0 && (
                <Section icon={FileText} title="Projects">
                  <div className="space-y-3">
                    {projects.map((project, index) => (
                      <TimelineCard
                        key={`${project.title || project.name}-${index}`}
                        title={project.title || project.name}
                        subtitle={project.company || project.client}
                        period={project.duration}
                        description={project.description}
                        technologies={project.technologies || project.techStack}
                        links={project.links || project.link}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {education.length > 0 && (
                <Section icon={GraduationCap} title="Education">
                  <div className="space-y-3">
                    {education.map((edu, index) => {
                      const title = getTextValue(
                        edu.degree,
                        edu.course,
                        edu.qualification
                      );

                      const subtitle = getTextValue(
                        edu.institution,
                        edu.college,
                        edu.university,
                        edu.school
                      );

                      const period = getTextValue(
                        edu.year,
                        [edu.start_date, edu.end_date]
                          .filter(Boolean)
                          .join(" - "),
                        [edu.startDate, edu.endDate].filter(Boolean).join(" - ")
                      );

                      return (
                        <TimelineCard
                          key={`${title}-${index}`}
                          title={title}
                          subtitle={subtitle}
                          period={period}
                          description={edu.description}
                        />
                      );
                    })}
                  </div>
                </Section>
              )}

              {certifications.length > 0 && (
                <Section icon={Award} title="Certifications">
                  <SimpleList
                    items={certifications}
                    emptyMessage="No certifications found."
                  />
                </Section>
              )}

              {achievements.length > 0 && (
                <Section icon={Award} title="Achievements">
                  <SimpleList
                    items={achievements}
                    emptyMessage="No achievements found."
                  />
                </Section>
              )}

              {languages.length > 0 && (
                <Section icon={Globe2} title="Languages">
                  <TagList items={languages} />
                </Section>
              )}

              {interests.length > 0 && (
                <Section icon={Sparkles} title="Interests">
                  <TagList items={interests} />
                </Section>
              )}

              <Section icon={FileText} title="Resume File Preview">
                <div className="overflow-hidden rounded-2xl border border-[var(--session-border)] bg-white">
                  {previewLoading && (
                    <div className="grid h-80 place-items-center text-sm font-semibold text-slate-500 sm:h-96">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading resume preview...
                      </span>
                    </div>
                  )}

                  {!previewLoading && previewError && (
                    <div className="grid h-80 place-items-center px-4 text-center text-sm font-medium text-slate-500 sm:h-96">
                      {previewError}
                    </div>
                  )}

                  {!previewLoading && !previewError && previewSrc && (
                    <iframe
                      key={previewSrc}
                      src={previewSrc}
                      title="Resume Preview"
                      className="h-80 w-full bg-white sm:h-[28rem] lg:h-[32rem]"
                    />
                  )}

                  {!previewLoading && !previewError && !previewSrc && (
                    <EmptyState message="Resume file preview is not available." />
                  )}
                </div>
              </Section>
            </main>
          </div>
        </div>
      </section>
    </div>,
    portalTarget
  );
}
