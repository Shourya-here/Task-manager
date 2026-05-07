import * as projectService from '../services/project.service.js';

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.user);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const member = await projectService.addMember(req.params.id, req.body.userId);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    await projectService.removeMember(req.params.id, req.params.userId);
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};
