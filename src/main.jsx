import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";

// ✅ ADD THIS
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // cache for 5 min ✅
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,    // ❌ prevents extra calls
      refetchOnMount: false,          // ❌ prevents duplicate calls
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: `${window.location.origin}/auth/callback`,
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        <App />
      </Auth0Provider>
    </QueryClientProvider>
  </StrictMode>
);