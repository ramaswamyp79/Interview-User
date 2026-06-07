import axiosInstance from "./axiosInstance";

export const uploadToGCS = async (file, title) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("title", title);

    const { data } = await axiosInstance.post(
      "/upload/upload-resume",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error?.response?.data || error;
  }
};