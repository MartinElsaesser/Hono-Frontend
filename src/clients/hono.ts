import { hc } from "hono/client";
import type { ApiRoutes } from "../../../Hono-Backend/src/server";

export const honoClient = hc<ApiRoutes>("http://localhost:3000");
