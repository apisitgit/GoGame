export type MockRunResult =
  | {
      status: "passed";
      stdout: string;
      message: string;
    }
  | {
      status: "failed";
      stdout: string;
      message: string;
    };

export type SubmissionState =
  | { status: "idle" }
  | { status: "passed"; stdout: string; message: string }
  | { status: "failed"; stdout: string; message: string };
