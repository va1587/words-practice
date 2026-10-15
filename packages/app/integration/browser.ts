import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { promisify } from "node:util";
import { inject } from "vitest";

const run = promisify(execFile);
const cli = createRequire(import.meta.url).resolve("agent-browser/bin/agent-browser.js");

type CliResult<T> = { success: boolean; data: T; error: string | null };

type A11yViolation = { id: string; impact: string | null; nodes: unknown[] };

/**
 * Thin typed wrapper around the agent-browser CLI (https://agent-browser.dev).
 * Each instance drives its own isolated browser session against the temporary app instance.
 */
export class Browser {
  private readonly baseUrl = inject("appUrl");

  constructor(private readonly session: string) {}

  async open(path: string) {
    await this.cli(["open", new URL(path, this.baseUrl).toString()]);
  }

  /** Waits until the text is rendered — data streams in after the static shell. */
  async waitForText(text: string) {
    await this.cli(["wait", "--text", text]);
  }

  async waitForUrl(path: string) {
    await this.cli(["wait", "--url", `**${path}`]);
  }

  async text(selector: string) {
    return (await this.cli<{ text: string }>(["get", "text", selector])).text;
  }

  async count(selector: string) {
    return (await this.cli<{ count: number }>(["get", "count", selector])).count;
  }

  async attribute(selector: string, name: string) {
    return (await this.cli<{ value: string | null }>(["get", "attr", selector, name])).value;
  }

  async url() {
    return (await this.cli<{ url: string }>(["get", "url"])).url;
  }

  async clickLink(name: string) {
    await this.cli(["find", "role", "link", "click", "--name", name]);
  }

  /** WCAG 2.2 A/AA violations with serious or critical impact (engineering standards §5.5). */
  async seriousA11yViolations() {
    const report = await this.cli<{ violations: A11yViolation[] }>([
      "a11y",
      "--tags",
      "wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa",
    ]);
    return report.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => v.id);
  }

  async close() {
    await this.cli(["close"]).catch(() => undefined);
  }

  private async cli<T>(args: string[]): Promise<T> {
    const argv = [cli, ...args, "--session", this.session, "--json"];
    let stdout: string;
    try {
      ({ stdout } = await run(process.execPath, argv, { maxBuffer: 16 * 1024 * 1024 }));
    } catch (error) {
      // agent-browser exits with 1 on failure but still prints the JSON result.
      stdout = (error as { stdout?: string }).stdout ?? "";
      if (!stdout) throw error;
    }
    const result = JSON.parse(stdout) as CliResult<T>;
    if (!result.success) {
      throw new Error(`agent-browser ${args.join(" ")}: ${result.error ?? "unknown error"}`);
    }
    return result.data;
  }
}
