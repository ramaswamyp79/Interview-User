import axiosInstance from "./axiosInstance";

export const getResumePreviewUrl = async (fileUrl) => {
  if (!fileUrl) return "";

  const res = await axiosInstance.get(
    `/resume/view?fileUrl=${encodeURIComponent(fileUrl)}`
  );

  return res.data.url;
};