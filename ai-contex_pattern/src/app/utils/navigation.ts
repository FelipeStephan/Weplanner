/** Pure hash-navigation helpers — no React state required */

export const openOverviewDashboardPage = () => {
  window.location.hash = "/overview-dashboard";
};

export const openDesignSystemPage = () => {
  window.location.hash = "/design-system";
};

export const openReportsDashboardPage = () => {
  window.location.hash = "/reports-dashboard";
};

export const openTeamPage = () => {
  window.location.hash = "/team";
};

export const openSettingsPage = () => {
  window.location.hash = "/settings";
};

export const openClientsPage = () => {
  window.location.hash = "/clients";
};
