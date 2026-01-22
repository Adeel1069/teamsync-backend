import Project from "../models/projectModel.js";
import AppError from "../utils/AppError.js";

/** Create a new project */
export const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body;

    const newProject = new Project({ name, description, startDate, endDate });

    await newProject.save();

    res
      .status(201)
      .json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    next(error);
  }
};

/** Get projects */
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find();
    res.status(200).json({ success: true, message: "Success", projects });
  } catch (error) {
    next(error);
  }
};

/**  Get a single project by ID */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      throw new AppError("Project no found", 404);
    }

    res.status(200).json({ message: "success", project });
  } catch (error) {
    next(error);
  }
};

/**  Update a single project */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, description, startDate, endDate, status },
      { new: true },
    );

    if (!updatedProject) {
      throw new AppError("Project no found", 404);
    }

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/** Delete a project by ID */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      throw new AppError("Project no found", 404);
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};
