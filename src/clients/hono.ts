import { hc } from "hono/client";
import type { ApiRoutes } from "../../../Backend/src/server";

export const honoClient = hc<ApiRoutes>("http://localhost:3000");
