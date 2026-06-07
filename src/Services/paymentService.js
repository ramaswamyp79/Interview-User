import api from "../utils/axiosInstance";

export const buyCredits = async (plan) => {
  const res = await api.post("/users/buy-credits", { plan });

  const checkoutUrl = res.data?.url;
  if (!checkoutUrl) {
    throw new Error("No checkout URL returned from server");
  }

  // ✅ Stripe 2025+ way
  window.location.href = checkoutUrl;
};