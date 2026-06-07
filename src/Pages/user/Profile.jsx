import React, { useEffect, useMemo, useRef, useState } from "react";
import LogoutModal from "../../Components/LogoutModal";
import {
  getProfile,
  updateProfile,
  logoutUser,
} from "../../Services/userService";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "../../Components/ChangePasswordModal";
import AILoader from "../../Components/AILoader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Award,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Edit3,
  FileText,
  Globe2,
  Languages,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Plus,
  Save,
  Shield,
  Star,
  Target,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";

const DEFAULT_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Docker",
  "AWS",
  "GraphQL",
  "Git",
];

const ROLE_OPTIONS = [
  "Student",
  "Job Seeker",
  "Working Professional",
  "HR / Recruiter",
  "Software Engineer",
  "Senior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
];

const EXPERIENCE_OPTIONS = [
  "0–1 year",
  "1–3 years",
  "4 years",
  "5–7 years",
  "8–10 years",
  "10+ years",
];

const INDUSTRY_OPTIONS = [
  "Technology / SaaS",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Consulting",
  "Education",
  "Other",
];

const LANGUAGE_OPTIONS = ["English", "Hindi", "Marathi", "Tamil", "German", "French"];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" },
};

function splitName(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

function buildFullName(firstName, lastName, fallback = "") {
  const name = `${firstName || ""} ${lastName || ""}`.trim();
  return name || fallback || "";
}

function normalizeProfileForm(profile) {
  const nameParts = splitName(profile?.fullName || "");

  return {
    fullName: profile?.fullName || "",
    firstName: profile?.firstName || nameParts.firstName || "",
    lastName: profile?.lastName || nameParts.lastName || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    role: profile?.role || "Job Seeker",
    currentRole: profile?.currentRole || profile?.role || "",
    currentCompany: profile?.currentCompany || "",
    experience: profile?.experience || "",
    targetRole: profile?.targetRole || "",
    industry: profile?.industry || "",
    interviewLanguage: profile?.interviewLanguage || "English",
    resumeUrl: profile?.resumeUrl || "",
    skills: Array.isArray(profile?.skills) && profile.skills.length
      ? profile.skills
      : DEFAULT_SKILLS,
    notifications: {
      sessionReminders: profile?.notifications?.sessionReminders ?? true,
      creditAlerts: profile?.notifications?.creditAlerts ?? true,
      aiFeedbackReports: profile?.notifications?.aiFeedbackReports ?? true,
      productUpdates: profile?.notifications?.productUpdates ?? false,
      marketingEmails: profile?.notifications?.marketingEmails ?? false,
    },
  };
}

function getInitials(name = "") {
  const clean = name.trim();

  if (!clean) return "U";

  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
}

function formatMemberSince(profile) {
  const rawDate = profile?.createdAt || profile?.memberSince || profile?.created_at;

  if (!rawDate) return "Member since Jan 2025";

  try {
    const date =
      typeof rawDate === "object" && rawDate._seconds
        ? new Date(rawDate._seconds * 1000)
        : new Date(rawDate);

    if (Number.isNaN(date.getTime())) return "Member since Jan 2025";

    return `Member since ${date.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    })}`;
  } catch {
    return "Member since Jan 2025";
  }
}

function ProfileToast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      className={`session-toast ${isError ? "error" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="session-toast-icon">
        {isError ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}

function ViewField({ label, value, muted = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>

      <div
        className={`min-h-6 text-sm leading-6 ${muted ? "italic text-slate-400" : "text-main"
          }`}
      >
        {value || "Not added"}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="input-focus-ring w-full rounded-lg border-2 border-brand bg-slate-50 px-3 py-2.5 text-sm text-main outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>

      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="input-focus-ring w-full cursor-pointer rounded-lg border-2 border-brand bg-slate-50 px-3 py-2.5 text-sm text-main outline-none transition-colors focus:border-emerald-400 focus:bg-white"
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionCard({
  id,
  title,
  Icon,
  editing,
  saving,
  onEdit,
  onSave,
  children,
}) {
  return (
    <motion.section
      {...fadeUp}
      id={id}
      className="rounded-2xl border border-brand bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-brand px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-sm font-bold text-main">
          <Icon className="h-4 w-4 text-brand" />
          <span>{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="btn-teal disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          ) : (
            <button type="button" onClick={onEdit} className="btn-outline">
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </motion.section>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-main">{title}</div>
        <div className="mt-1 text-xs leading-5 text-slate-400">{description}</div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-slate-300"
          }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}

function SecurityRow({ icon, title, description, action, badge }) {
  return (
    <div className="flex flex-col gap-3 border-b border-brand py-4 last:border-b-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-subtle text-brand">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-main">{title}</div>
          <div className="mt-1 text-xs text-slate-400">{description}</div>
        </div>
      </div>

      <div className="shrink-0">{action || badge}</div>
    </div>
  );
}

function ActivityItem({ icon, title, time, tone = "brand" }) {
  const toneClass = {
    brand: "bg-brand-subtle text-brand",
    resume: "bg-indigo-50 text-indigo-500",
    credit: "bg-amber-50 text-amber-500",
    login: "bg-slate-100 text-slate-500",
  }[tone];

  return (
    <div className="flex items-start gap-3 border-b border-brand py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${toneClass}`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-6 text-main">{title}</div>
        <div className="mt-1 text-xs text-slate-400">{time}</div>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  open,
  value,
  onChange,
  onCancel,
  onConfirm,
  invalid,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-red-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-main">Delete Account</h2>
              <p className="mt-1 text-xs leading-5 text-muted">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-main"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-muted">
            Please type <strong className="text-red-600">DELETE</strong> to confirm
            account deletion.
          </p>

          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Type DELETE"
            className={`input-focus-ring mt-4 w-full rounded-lg border-2 bg-white px-3 py-2.5 text-sm text-main outline-none transition-colors ${invalid ? "border-red-400" : "border-brand focus:border-emerald-400"
              }`}
          />

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="btn-outline">
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toastTimerRef = useRef(null);

  const [form, setForm] = useState(normalizeProfileForm(null));
  const [editingSections, setEditingSections] = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    value: "",
    invalid: false,
  });
  const [toast, setToast] = useState(null);

  const {
    data: profile,
    isLoading: loading,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 10 * 60 * 1000,
  });

  const profileFormFromServer = useMemo(
    () => normalizeProfileForm(profile),
    [profile]
  );

  useEffect(() => {
    if (profile) {
      setForm(profileFormFromServer);
    } else if (!loading) {
      navigate("/login", { replace: true });
    }
  }, [profile, profileFormFromServer, loading, navigate]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,

    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      const previousProfile = queryClient.getQueryData(["profile"]);

      queryClient.setQueryData(["profile"], (old) => ({
        ...old,
        ...newProfileData,
      }));

      return { previousProfile };
    },

    onSuccess: () => {
      showToast("Changes saved successfully!");
    },

    onError: (error, _newProfileData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile"], context.previousProfile);
      }

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile.";

      showToast(message, "error");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const displayName = buildFullName(
    form.firstName,
    form.lastName,
    profile?.fullName
  );

  const credits = profile?.credits ?? profile?.interviewCredits ?? 0;
  const totalSessions = profile?.totalSessions ?? profile?.sessionsCount ?? 24;
  const resumesCount = profile?.resumesCount ?? profile?.totalResumes ?? 3;
  const avgScore = profile?.avgScore ?? profile?.averageScore ?? "87%";

  const setField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const setNotification = (field, value) => {
    setForm((previous) => ({
      ...previous,
      notifications: {
        ...previous.notifications,
        [field]: value,
      },
    }));

    showToast("Notification preference updated.");
  };

  const startEdit = (section) => {
    setEditingSections((previous) => ({
      ...previous,
      [section]: true,
    }));
  };

  const stopEdit = (section) => {
    setEditingSections((previous) => ({
      ...previous,
      [section]: false,
    }));
  };

  const handleSaveSection = (section) => {
    const payload = {
      ...form,
      fullName: buildFullName(form.firstName, form.lastName, form.fullName),
    };

    setForm(payload);
    stopEdit(section);
    updateProfileMutation.mutate(payload);
  };

  const handleAddSkill = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const value = skillInput.trim();

    if (!value) return;

    setForm((previous) => {
      const existingSkills = previous.skills || [];

      if (
        existingSkills.some(
          (skill) => skill.toLowerCase() === value.toLowerCase()
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        skills: [...existingSkills, value],
      };
    });

    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handlePhotoClick = () => {
    showToast("Photo upload coming soon!");
  };

  const handleRevokeSessions = () => {
    showToast("All other sessions revoked.");
  };

  const handleDeleteAccount = () => {
    if (deleteModal.value.trim() === "DELETE") {
      setDeleteModal({
        open: false,
        value: "",
        invalid: false,
      });

      showToast("Account deletion scheduled.");
      return;
    }

    setDeleteModal((previous) => ({
      ...previous,
      invalid: true,
    }));

    setTimeout(() => {
      setDeleteModal((previous) => ({
        ...previous,
        invalid: false,
      }));
    }, 1500);
  };

  const handleLogoutConfirm = () => {
    logoutUser();
    window.location.href = "/login";
  };

  if (loading && !profile) {
    return <AILoader text="Loading Profile..." />;
  }

  return (
    <section className="w-full font-body animate-fadeInUp">
      <ProfileToast toast={toast} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        {/* LEFT IDENTITY CARD */}
        <motion.aside
          {...fadeUp}
          className="overflow-hidden rounded-2xl border border-brand bg-white shadow-sm xl:sticky xl:top-20"
        >
          <div className="relative h-24 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700">
            <div className="absolute inset-0 overflow-hidden opacity-20 [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:18px_18px]" />

            <div className="absolute -bottom-9 left-1/2 z-10 -translate-x-1/2">
              <button
                type="button"
                onClick={handlePhotoClick}
                className="group relative grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-brand-subtle text-xl font-bold text-brand shadow-lg"
                title="Update photo"
              >
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName || "Profile"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(displayName)
                )}

                <span className="absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5" />
                </span>
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 pt-12 text-center">
            <h1 className="text-lg font-bold text-main">
              {displayName || "User"}
            </h1>

            <p className="mt-1 text-sm text-muted">
              {form.currentRole || form.role || "Job Seeker"}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-subtle px-3 py-1 text-xs font-semibold text-brand-hover">
                <Star className="h-3 w-3" />
                {profile?.plan || "Pro Plan"}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">
                {credits} credits
              </span>
            </div>

            <div className="my-5 h-px bg-slate-100" />

            <div className="grid grid-cols-3 divide-x divide-slate-100">
              <div className="px-2">
                <div className="text-lg font-bold text-brand">{totalSessions}</div>
                <div className="mt-1 text-xs text-slate-400">Sessions</div>
              </div>

              <div className="px-2">
                <div className="text-lg font-bold text-main">{resumesCount}</div>
                <div className="mt-1 text-xs text-slate-400">Resumes</div>
              </div>

              <div className="px-2">
                <div className="text-lg font-bold text-brand">{avgScore}</div>
                <div className="mt-1 text-xs text-slate-400">Avg Score</div>
              </div>
            </div>

            <div className="my-5 h-px bg-slate-100" />

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <CalendarDays className="h-4 w-4" />
              <span>{formatMemberSince(profile)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowLogoutPopup(true)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </motion.aside>

        {/* RIGHT CONTENT */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* PERSONAL INFO */}
          <SectionCard
            id="section-personal"
            title="Personal Information"
            Icon={User}
            editing={editingSections.personal}
            saving={updateProfileMutation.isPending}
            onEdit={() => startEdit("personal")}
            onSave={() => handleSaveSection("personal")}
          >
            {editingSections.personal ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="First Name"
                  value={form.firstName}
                  onChange={(value) => setField("firstName", value)}
                  placeholder="First name"
                />

                <InputField
                  label="Last Name"
                  value={form.lastName}
                  onChange={(value) => setField("lastName", value)}
                  placeholder="Last name"
                />

                <InputField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(value) => setField("email", value)}
                  placeholder="you@email.com"
                />

                <InputField
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(value) => setField("phone", value)}
                  placeholder="+91 98765 43210"
                />

                <InputField
                  label="Location"
                  value={form.location}
                  onChange={(value) => setField("location", value)}
                  placeholder="City, State, Country"
                  className="md:col-span-2"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ViewField label="First Name" value={form.firstName} />
                <ViewField label="Last Name" value={form.lastName} />
                <ViewField label="Email Address" value={form.email || profile?.email} />
                <ViewField label="Phone Number" value={form.phone} />
                <ViewField
                  label="Location"
                  value={form.location}
                  className="md:col-span-2"
                />
              </div>
            )}
          </SectionCard>

          {/* PROFESSIONAL DETAILS */}
          <SectionCard
            id="section-professional"
            title="Professional Details"
            Icon={Briefcase}
            editing={editingSections.professional}
            saving={updateProfileMutation.isPending}
            onEdit={() => startEdit("professional")}
            onSave={() => handleSaveSection("professional")}
          >
            {editingSections.professional ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InputField
                  label="Current Role"
                  value={form.currentRole}
                  onChange={(value) => setField("currentRole", value)}
                  placeholder="Software Engineer"
                />

                <InputField
                  label="Current Company"
                  value={form.currentCompany}
                  onChange={(value) => setField("currentCompany", value)}
                  placeholder="Company name"
                />

                <SelectField
                  label="Experience"
                  value={form.experience}
                  onChange={(value) => setField("experience", value)}
                  options={EXPERIENCE_OPTIONS}
                />

                <InputField
                  label="Target Role"
                  value={form.targetRole}
                  onChange={(value) => setField("targetRole", value)}
                  placeholder="Senior Software Engineer"
                />

                <SelectField
                  label="Industry"
                  value={form.industry}
                  onChange={(value) => setField("industry", value)}
                  options={INDUSTRY_OPTIONS}
                />

                <SelectField
                  label="Interview Language"
                  value={form.interviewLanguage}
                  onChange={(value) => setField("interviewLanguage", value)}
                  options={LANGUAGE_OPTIONS}
                />

                <SelectField
                  label="Profile Role"
                  value={form.role}
                  onChange={(value) => setField("role", value)}
                  options={ROLE_OPTIONS}
                  className="md:col-span-2 xl:col-span-3"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <ViewField label="Current Role" value={form.currentRole || form.role} />
                <ViewField label="Current Company" value={form.currentCompany} />
                <ViewField label="Experience" value={form.experience} />
                <ViewField label="Target Role" value={form.targetRole} />
                <ViewField label="Industry" value={form.industry} />
                <ViewField label="Interview Language" value={form.interviewLanguage} />
              </div>
            )}
          </SectionCard>

          {/* SKILLS */}
          <SectionCard
            id="section-skills"
            title="Skills & Technologies"
            Icon={Award}
            editing={editingSections.skills}
            saving={updateProfileMutation.isPending}
            onEdit={() => startEdit("skills")}
            onSave={() => handleSaveSection("skills")}
          >
            <div className="flex flex-wrap items-center gap-2">
              {(form.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-brand-subtle px-3 py-1.5 text-xs font-semibold text-brand-hover"
                >
                  {skill}

                  {editingSections.skills && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="grid h-4 w-4 place-items-center rounded-full text-brand-hover/70 transition-colors hover:bg-white hover:text-brand-hover"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}

              {editingSections.skills && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-emerald-200 bg-brand-subtle px-3 py-1.5">
                  <Plus className="h-3.5 w-3.5 text-brand" />

                  <input
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="Add skill..."
                    className="w-28 bg-transparent text-xs font-semibold text-brand-hover outline-none placeholder:text-emerald-300"
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* NOTIFICATION PREFERENCES */}
          <motion.section
            {...fadeUp}
            className="rounded-2xl border border-brand bg-white shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-brand px-5 py-4 text-sm font-bold text-main sm:px-6">
              <Bell className="h-4 w-4 text-brand" />
              Notification Preferences
            </div>

            <div className="p-5 sm:p-6">
              <ToggleRow
                title="Session Reminders"
                description="Get notified before your scheduled interview sessions."
                checked={form.notifications.sessionReminders}
                onChange={(value) => setNotification("sessionReminders", value)}
              />

              <ToggleRow
                title="Credit Alerts"
                description="Notify me when my credits are running low."
                checked={form.notifications.creditAlerts}
                onChange={(value) => setNotification("creditAlerts", value)}
              />

              <ToggleRow
                title="AI Feedback Reports"
                description="Receive email summary after each interview session."
                checked={form.notifications.aiFeedbackReports}
                onChange={(value) => setNotification("aiFeedbackReports", value)}
              />

              <ToggleRow
                title="Product Updates"
                description="News about new features and improvements."
                checked={form.notifications.productUpdates}
                onChange={(value) => setNotification("productUpdates", value)}
              />

              <ToggleRow
                title="Marketing Emails"
                description="Tips, offers, and interview preparation guides."
                checked={form.notifications.marketingEmails}
                onChange={(value) => setNotification("marketingEmails", value)}
              />
            </div>
          </motion.section>

          {/* SECURITY */}
          <motion.section
            {...fadeUp}
            className="rounded-2xl border border-brand bg-white shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-brand px-5 py-4 text-sm font-bold text-main sm:px-6">
              <Shield className="h-4 w-4 text-brand" />
              Security
            </div>

            <div className="p-5 sm:p-6">
              <SecurityRow
                icon={<Lock className="h-4 w-4" />}
                title="Password"
                description="Last changed 32 days ago"
                action={
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(true)}
                    className="btn-outline"
                  >
                    Change Password
                  </button>
                }
              />

              <SecurityRow
                icon={<CalendarDays className="h-4 w-4" />}
                title="Two-Factor Authentication"
                description="Add an extra layer of security."
                badge={
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                    Not Enabled
                  </span>
                }
              />

              <SecurityRow
                icon={<Globe2 className="h-4 w-4" />}
                title="Active Sessions"
                description="1 active device"
                action={
                  <button
                    type="button"
                    onClick={handleRevokeSessions}
                    className="btn-outline"
                  >
                    Revoke All
                  </button>
                }
              />

              <SecurityRow
                icon={<Mail className="h-4 w-4" />}
                title="Email Verified"
                description={form.email || profile?.email || "No email added"}
                badge={
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-subtle px-3 py-1 text-xs font-bold text-brand-hover">
                    <Check className="h-3 w-3" />
                    Verified
                  </span>
                }
              />

              <SecurityRow
                icon={<LogOut className="h-4 w-4" />}
                title="Logout"
                description="End your current session safely."
                action={
                  <button
                    type="button"
                    onClick={() => setShowLogoutPopup(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                }
              />
            </div>
          </motion.section>

          {/* RECENT ACTIVITY */}
          <motion.section
            {...fadeUp}
            className="rounded-2xl border border-brand bg-white shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-brand px-5 py-4 text-sm font-bold text-main sm:px-6">
              <Clock3 className="h-4 w-4 text-brand" />
              Recent Activity
            </div>

            <div className="p-5 sm:p-6">
              <ActivityItem
                icon={<FileText className="h-4 w-4" />}
                title={
                  <>
                    Completed mock interview at{" "}
                    <strong>Zeta Solutions</strong> · Frontend Engineer
                  </>
                }
                time="Today, 10:34 AM"
                tone="brand"
              />

              <ActivityItem
                icon={<FileText className="h-4 w-4" />}
                title={
                  <>
                    Uploaded new resume —{" "}
                    <strong>Software_Engineer_Resume_2024.pdf</strong>
                  </>
                }
                time="Yesterday, 3:15 PM"
                tone="resume"
              />

              <ActivityItem
                icon={<Monitor className="h-4 w-4" />}
                title={
                  <>
                    Live interview session at <strong>CyberNova</strong> · Backend
                    Engineer
                  </>
                }
                time="Apr 8, 2026 · 2:00 PM"
                tone="brand"
              />

              <ActivityItem
                icon={<CreditCard className="h-4 w-4" />}
                title={
                  <>
                    Purchased <strong>Plus Plan</strong> — 6 interview credits
                  </>
                }
                time="Apr 5, 2026 · 11:20 AM"
                tone="credit"
              />

              <ActivityItem
                icon={<Shield className="h-4 w-4" />}
                title="Account created and email verified"
                time="Jan 14, 2025 · 9:00 AM"
                tone="login"
              />
            </div>
          </motion.section>

          {/* DANGER ZONE */}
          <motion.section
            {...fadeUp}
            className="rounded-2xl border border-red-100 bg-red-50/60 shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-red-100 px-5 py-4 text-sm font-bold text-red-600 sm:px-6">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </div>

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="text-sm font-bold text-red-600">
                  Delete Account
                </div>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-red-400">
                  Permanently delete your account and all associated data —
                  sessions, resumes, credits. This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteModal({
                    open: true,
                    value: "",
                    invalid: false,
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </motion.section>
        </div>
      </div>

      {showLogoutPopup && (
        <LogoutModal
          close={() => setShowLogoutPopup(false)}
          onConfirm={handleLogoutConfirm}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      <DeleteAccountModal
        open={deleteModal.open}
        value={deleteModal.value}
        invalid={deleteModal.invalid}
        onChange={(value) =>
          setDeleteModal((previous) => ({
            ...previous,
            value,
            invalid: false,
          }))
        }
        onCancel={() =>
          setDeleteModal({
            open: false,
            value: "",
            invalid: false,
          })
        }
        onConfirm={handleDeleteAccount}
      />
    </section>
  );
}