import express from "express";
import {
  filterUniversities,
  supportedCountries,
  supportedRegions,
  getFacultiesForInstitution,
  isValidInstitution,
} from "../utils/universities.js";
import { getDegreesForInstitution } from "../utils/degrees.js";
import { sendSuccess } from "../utils/response.js";
import { sendError } from "../utils/error.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import * as schoolVerificationController from "../controllers/schoolVerification.controller.js";
import schoolVerificationValidator from "../validators/schoolVerification.validator.js";
import adminRoutes from "./admin/index.route.js";

const router = express.Router();

router.get("/", (req, res) => {
  console.log(req.ip);

  return sendSuccess(200, "Welcome to SIS", res);
});

router.get("/health", (req, res) => {
  console.log(req.ip);

  return sendSuccess(200, "Server is healthy", res);
});

// School verification callback (public)
router.post(
  "/verify/callback/:requestId",
  validateRequest(schoolVerificationValidator.schoolVerificationCallbackSchema),
  schoolVerificationController.handleSchoolVerificationCallback,
);

// Public endpoint to fetch universities filtered by region/country
router.get("/universities", (req, res) => {
  const region = (req.query.region as string | undefined)?.toLowerCase();
  const countryCode = (
    req.query.countryCode as string | undefined
  )?.toUpperCase();

  const filters: {
    region?: (typeof supportedRegions)[number];
    countryCode?: string;
  } = {};

  if (region && (supportedRegions as string[]).includes(region)) {
    filters.region = region as (typeof supportedRegions)[number];
  }

  if (countryCode && supportedCountries.includes(countryCode)) {
    filters.countryCode = countryCode;
  }

  const data = filterUniversities(filters);

  return sendSuccess(200, "Universities retrieved", res, {
    availableRegions: supportedRegions,
    availableCountries: supportedCountries,
    count: data.length,
    items: data,
  });
});

// Public endpoint to fetch faculties for a specific institution
router.get("/institutions/:code/faculties", (req, res) => {
  const institutionCode = req.params.code?.toUpperCase();

  if (!institutionCode) {
    return sendError(400, "Institution code is required", res);
  }

  if (!isValidInstitution(institutionCode)) {
    return sendError(404, "Institution not found", res);
  }

  const faculties = getFacultiesForInstitution(institutionCode);

  return sendSuccess(200, "Faculties retrieved successfully", res, {
    institutionCode,
    count: faculties.length,
    faculties,
  });
});

// Public endpoint to fetch degrees for a specific institution
router.get("/institutions/:code/degrees", (req, res) => {
  const institutionCode = req.params.code?.toUpperCase();

  if (!institutionCode) {
    return sendError(400, "Institution code is required", res);
  }

  if (!isValidInstitution(institutionCode)) {
    return sendError(404, "Institution not found", res);
  }

  const degrees = getDegreesForInstitution(institutionCode);

  return sendSuccess(200, "Degrees retrieved successfully", res, {
    institutionCode,
    count: degrees.length,
    degrees,
  });
});

// Admin routes
router.use("/admin", adminRoutes);

export default router;
