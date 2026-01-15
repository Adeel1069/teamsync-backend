import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import { validate } from "../middlewares/validate.js";
import {
  validateProjectId,
  createProjectValidator,
  updateProjectValidator,
} from "../validators/projectValidators.js";

const router = express.Router();

router.post("/", createProjectValidator, validate, createProject);
router.get("/", getProjects);

router.get("/:id", validateProjectId, validate, getProjectById);
router.put(
  "/:id",
  validateProjectId,
  updateProjectValidator,
  validate,
  updateProject
);
router.delete("/:id", validateProjectId, validate, deleteProject);

export default router;
