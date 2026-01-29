import cron from "node-cron";
import logger from "../utils/logger.js";
import { CRON_ENABLED } from "../config/envConfig.js";
import softDeleteAuditJob from "./softDeleteAudit.js";

const log = logger.child("CRON");

/**
 * Registry of all cron jobs
 * Each job should have: name, schedule, handler, enabled
 */
const jobs = [softDeleteAuditJob];

/**
 * Store for active cron tasks (for graceful shutdown)
 */
const activeTasks = new Map();

/**
 * Wrap job handler with error handling and logging
 */
const wrapHandler = (job) => {
  return async () => {
    const startTime = Date.now();
    log.info(`Starting job: ${job.name}`);

    try {
      await job.handler();
      const duration = Date.now() - startTime;
      log.info(`Completed job: ${job.name}`, { durationMs: duration });
    } catch (error) {
      const duration = Date.now() - startTime;
      log.error(`Failed job: ${job.name}`, {
        error: error.message,
        durationMs: duration,
      });
    }
  };
};

/**
 * Initialize and start all cron jobs
 * Should be called after database connection is established
 */
export const initializeCronJobs = () => {
  if (!CRON_ENABLED) {
    log.info("Cron jobs are disabled via CRON_ENABLED=false");
    return;
  }

  log.info("Initializing cron jobs...");

  for (const job of jobs) {
    if (!job.enabled) {
      log.info(`Skipping disabled job: ${job.name}`);
      continue;
    }

    // Validate cron expression
    if (!cron.validate(job.schedule)) {
      log.error(`Invalid cron expression for job: ${job.name}`, {
        schedule: job.schedule,
      });
      continue;
    }

    // Schedule the job
    const task = cron.schedule(job.schedule, wrapHandler(job), {
      scheduled: true,
      timezone: job.timezone || "UTC",
    });

    activeTasks.set(job.name, task);

    log.info(`Scheduled job: ${job.name}`, {
      schedule: job.schedule,
      timezone: job.timezone || "UTC",
    });
  }

  log.info(`Cron jobs initialized: ${activeTasks.size} active`);
};

/**
 * Stop all cron jobs gracefully
 * Should be called during application shutdown
 */
export const stopCronJobs = () => {
  log.info("Stopping cron jobs...");

  for (const [name, task] of activeTasks) {
    task.stop();
    log.info(`Stopped job: ${name}`);
  }

  activeTasks.clear();
  log.info("All cron jobs stopped");
};

/**
 * Run a specific job manually (useful for testing)
 * @param {string} jobName - Name of the job to run
 */
export const runJobManually = async (jobName) => {
  const job = jobs.find((j) => j.name === jobName);

  if (!job) {
    log.error(`Job not found: ${jobName}`);
    return;
  }

  log.info(`Manually triggering job: ${jobName}`);
  await wrapHandler(job)();
};

/**
 * Get status of all registered jobs
 */
export const getJobsStatus = () => {
  return jobs.map((job) => ({
    name: job.name,
    schedule: job.schedule,
    enabled: job.enabled,
    running: activeTasks.has(job.name),
  }));
};

export default {
  initializeCronJobs,
  stopCronJobs,
  runJobManually,
  getJobsStatus,
};
