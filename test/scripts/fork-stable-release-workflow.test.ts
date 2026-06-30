import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const workflowPath = ".github/workflows/fork-stable-release.yml";

describe("fork stable release workflow", () => {
  it("keeps registry and external release publication out of the fork release path", () => {
    const source = readFileSync(workflowPath, "utf8");

    expect(source).toContain('operation: "fork-github-release"');
    expect(source).toContain("npm install --global --prefix");
    expect(source).toContain("gh release create");
    expect(source).not.toContain("openclaw-npm-prepublish-verify");
    expect(source).not.toContain("npm publish");
    expect(source).not.toContain("id-token: write");
    expect(source).not.toContain("gh workflow run");
    expect(source).not.toContain("full-release-validation.yml");
    expect(source).not.toContain("OPENCLAW_RELEASES_DISPATCH_TOKEN");
  });

  it("requires exact fork confirmation and isolates write permission to release publication", () => {
    const workflow = parse(readFileSync(workflowPath, "utf8"));

    expect(workflow.on.workflow_dispatch.inputs.confirm_repository.required).toBe(true);
    expect(workflow.on.workflow_dispatch.inputs.publish_release.default).toBe(false);
    expect(workflow.permissions).toEqual({ contents: "read" });
    expect(workflow.env.FORK_REPOSITORY).toBe("kevinlin-openai/openclaw");
    expect(workflow.jobs.build.permissions).toEqual({ contents: "read" });
    expect(workflow.jobs.publish.environment).toBe("fork-release");
    expect(workflow.jobs.publish.permissions).toEqual({ contents: "write" });
  });
});
