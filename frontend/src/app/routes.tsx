import { createBrowserRouter } from "react-router";
import { Layout } from "@/components/layout/Layout";
import { UploadPage } from "@/features/upload/UploadPage";
import { InvestigationPage } from "@/features/investigation/InvestigationPage";
import { EvidencePage } from "@/features/evidence/EvidencePage";
import { ReportPage } from "@/features/report/ReportPage";
import { HistoryPage } from "@/features/history/HistoryPage";
import { ScannerPage } from "@/features/scanner/ScannerPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { IocPage } from "@/features/ioc/IocPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <UploadPage /> },
      { path: "investigation", element: <InvestigationPage /> },
      { path: "evidence", element: <EvidencePage /> },
      { path: "report", element: <ReportPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "scanner", element: <ScannerPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "ioc", element: <IocPage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
]);
