import { DEFAULT_BOARD_ID } from "../../demo/kanbanWorkspaceSeed";
import type { PageView } from "../types/navigation";

export const getRouteStateFromHash = (): {
  pageView: PageView;
  boardId: string | null;
} => {
  if (typeof window === "undefined") {
    return {
      pageView: "login",
      boardId: DEFAULT_BOARD_ID,
    };
  }

  const rawHash = window.location.hash.replace(/^#/, "");
  const [path, queryString = ""] = rawHash.split("?");
  const query = new URLSearchParams(queryString);
  const boardId = query.get("board");

  if (path === "/" || path === "" || path === "login") {
    return {
      pageView: "login",
      boardId: DEFAULT_BOARD_ID,
    };
  }

  if (path === "/overview-dashboard" || path === "overview-dashboard") {
    return {
      pageView: "overview-dashboard",
      boardId: DEFAULT_BOARD_ID,
    };
  }

  if (path === "/design-system") {
    return {
      pageView: "design-system",
      boardId,
    };
  }

  if (path === "/kanban-workspace") {
    return {
      pageView: "kanban-workspace",
      boardId: boardId || DEFAULT_BOARD_ID,
    };
  }

  if (path === "/reports-dashboard") {
    return {
      pageView: "reports-dashboard",
      boardId,
    };
  }

  if (path === "/team") {
    return {
      pageView: "team",
      boardId: null,
    };
  }

  if (path === "/settings") {
    return {
      pageView: "settings",
      boardId: null,
    };
  }

  if (path === "/clients") {
    return {
      pageView: "clients",
      boardId: null,
    };
  }

  return {
    pageView: "overview-dashboard",
    boardId,
  };
};
