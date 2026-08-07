export type CodeChallengeRunResult =
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
  | { status: "running"; message: string }
  | { status: "passed"; stdout: string; message: string }
  | { status: "failed"; stdout: string; message: string };

export type ChallengePassedMetadata = {
  sourceSize: number;
  stdoutPreview: string;
  feedback: string;
  submissionStored: boolean;
};
