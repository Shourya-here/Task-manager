import * as dashboardService from '../services/dashboard.service.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getOverdueTasks = async (req, res, next) => {
  try {
    const tasks = await dashboardService.getOverdueTasks(req.user);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
