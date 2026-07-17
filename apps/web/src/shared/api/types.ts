export type HealthResponse = {
  status: "ok";
  service: string;
  version: string;
};

export type HealthState =
  | { status: "loading" }
  | { status: "online"; service: string; version: string }
  | { status: "offline"; message: string };

