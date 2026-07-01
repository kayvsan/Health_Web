import cron from 'node-cron';
import { checkAllMonitors, setSocketIo } from './monitorChecker.js';

let jobs = [];

export const startScheduler = (io) => {
  setSocketIo(io);
  
  // 30 seconds
  jobs.push(cron.schedule('*/30 * * * * *', () => {
    checkAllMonitors(30);
  }));

  // 1 minute (60s)
  jobs.push(cron.schedule('* * * * *', () => {
    checkAllMonitors(60);
  }));

  // 5 minutes (300s)
  jobs.push(cron.schedule('*/5 * * * *', () => {
    checkAllMonitors(300);
  }));

  // 15 minutes (900s)
  jobs.push(cron.schedule('*/15 * * * *', () => {
    checkAllMonitors(900);
  }));
};

export const stopScheduler = () => {
  jobs.forEach(job => job.stop());
  jobs = [];
};
