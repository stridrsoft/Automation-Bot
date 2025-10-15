import { PrismaClient, RunStatus } from '@prisma/client';

export class JobService {
  constructor(private prisma: PrismaClient) {}

  async createJob(data: { name: string; url: string; steps: any[] }) {
    return this.prisma.job.create({ data: { name: data.name, url: data.url, stepsJson: data.steps } });
  }

  async listJobs() {
    return this.prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getJob(id: string) {
    return this.prisma.job.findUnique({ where: { id }, include: { runs: { orderBy: { createdAt: 'desc' } } } });
  }

  async createRun(jobId: string) {
    return this.prisma.run.create({
      data: { jobId, status: RunStatus.PENDING },
    });
  }

  async startRun(runId: string) {
    return this.prisma.run.update({ where: { id: runId }, data: { status: RunStatus.RUNNING, startedAt: new Date() } });
  }

  async completeRun(runId: string, logs: string, screenshot?: string) {
    return this.prisma.run.update({
      where: { id: runId },
      data: { status: RunStatus.SUCCESS, logs, screenshot: screenshot || null, finishedAt: new Date() },
    });
  }

  async failRun(runId: string, logs: string, error: string, screenshot?: string) {
    return this.prisma.run.update({
      where: { id: runId },
      data: { status: RunStatus.FAILED, logs, error, screenshot: screenshot || null, finishedAt: new Date() },
    });
  }
}


