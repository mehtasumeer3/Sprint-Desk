import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter  } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./app/App";
import { SessionBootstrap } from "./features/auth/SessionBootstrap";
import { ToastViewport } from "./components/ui/ToastViewport";
import "./index.css";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
        <SessionBootstrap>
          <App />
          <ToastViewport />
        </SessionBootstrap>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
