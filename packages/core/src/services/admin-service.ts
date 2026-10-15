import type { StatsRepository } from "../domain/ports";
import type { PathSummary, PlatformStats } from "../domain/types";

/** Read models for the admin panel. */
export class AdminService {
  private readonly stats: StatsRepository;

  constructor({ statsRepository }: { statsRepository: StatsRepository }) {
    this.stats = statsRepository;
  }

  overview(): Promise<PlatformStats> {
    return this.stats.platformStats();
  }

  paths(): Promise<PathSummary[]> {
    return this.stats.pathSummaries();
  }
}
