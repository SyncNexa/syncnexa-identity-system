/**
 * Manually curated faculty data for Nigerian universities
 * These override the empty faculties in the auto-generated universities.ts
 */

import type { Faculty } from "./universities.js";

export const NIGERIAN_FACULTIES: Record<string, Faculty[]> = {
  FUTO_NG: [
    {
      code: "FUTO_SICT_NG",
      name: "School of Information and Communication Technology",
      departments: [
        "Information Technology",
        "Computer Science",
        "Cyber Security",
        "Information Systems",
        "Software Engineering",
      ],
    },
    {
      code: "FUTO_SEET_NG",
      name: "School of Engineering and Engineering Technology",
      departments: [
        "Civil Engineering",
        "Electrical/Electronic Engineering",
        "Mechanical Engineering",
        "Chemical Engineering",
        "Agricultural Engineering",
        "Biomedical Engineering",
        "Materials and Metallurgical Engineering",
        "Petroleum Engineering",
        "Polymer and Textile Engineering",
        "Food Science and Technology",
        "Project Management Technology",
        "Transport Management Technology",
        "Building Technology",
      ],
    },
    {
      code: "FUTO_SOPS_NG",
      name: "School of Physical Sciences",
      departments: [
        "Mathematics",
        "Statistics",
        "Physics",
        "Chemistry",
        "Biochemistry",
        "Geology",
      ],
    },
    {
      code: "FUTO_SOBS_NG",
      name: "School of Biological Sciences",
      departments: [
        "Biology",
        "Biotechnology",
        "Microbiology",
        "Fisheries and Aquaculture",
      ],
    },
    {
      code: "FUTO_SOHT_NG",
      name: "School of Health Technology",
      departments: [
        "Public Health Technology",
        "Environmental Health Science",
        "Biomedical Technology",
      ],
    },
    {
      code: "FUTO_SEMS_NG",
      name: "School of Environmental Sciences",
      departments: [
        "Architecture",
        "Urban and Regional Planning",
        "Building",
        "Quantity Surveying",
        "Estate Management",
        "Surveying and Geoinformatics",
      ],
    },
    {
      code: "FUTO_SAAT_NG",
      name: "School of Agriculture and Agricultural Technology",
      departments: [
        "Agricultural Economics",
        "Agricultural Extension",
        "Animal Science and Technology",
        "Crop Science and Technology",
        "Forestry and Wildlife Technology",
        "Soil Science and Technology",
      ],
    },
    {
      code: "FUTO_SMAT_NG",
      name: "School of Management Technology",
      departments: [
        "Financial Management Technology",
        "Information Management Technology",
        "Maritime Management Technology",
        "Marketing",
      ],
    },
  ],
  IMSU_NG: [
    {
      code: "IMSU_AGRIC_NG",
      name: "Faculty of Agriculture",
      departments: [
        "Agricultural Economics",
        "Agricultural Extension",
        "Animal Science",
        "Crop Science",
        "Fisheries and Aquaculture",
        "Forestry and Wildlife",
        "Soil Science",
      ],
    },
    {
      code: "IMSU_ARTS_NG",
      name: "Faculty of Arts",
      departments: [
        "English and Literary Studies",
        "History and International Studies",
        "Languages and Linguistics",
        "Music",
        "Philosophy",
        "Theatre Arts",
      ],
    },
    {
      code: "IMSU_BMS_NG",
      name: "Faculty of Basic Medical Sciences",
      departments: ["Anatomy", "Physiology", "Biochemistry", "Pharmacology"],
    },
    {
      code: "IMSU_EDU_NG",
      name: "Faculty of Education",
      departments: [
        "Educational Management",
        "Educational Psychology",
        "Science Education",
        "Arts Education",
        "Social Sciences Education",
        "Vocational Education",
      ],
    },
    {
      code: "IMSU_ENG_NG",
      name: "Faculty of Engineering",
      departments: [
        "Agricultural Engineering",
        "Civil Engineering",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Petroleum Engineering",
      ],
    },
    {
      code: "IMSU_ENV_NG",
      name: "Faculty of Environmental Sciences",
      departments: [
        "Architecture",
        "Building",
        "Estate Management",
        "Quantity Surveying",
        "Surveying and Geoinformatics",
        "Urban and Regional Planning",
      ],
    },
    {
      code: "IMSU_LAW_NG",
      name: "Faculty of Law",
      departments: ["Public Law", "Private Law", "International Law"],
    },
    {
      code: "IMSU_MGMT_NG",
      name: "Faculty of Management Sciences",
      departments: [
        "Accounting",
        "Banking and Finance",
        "Business Administration",
        "Marketing",
        "Public Administration",
      ],
    },
    {
      code: "IMSU_SCI_NG",
      name: "Faculty of Science",
      departments: [
        "Biochemistry",
        "Biology",
        "Chemistry",
        "Computer Science",
        "Mathematics",
        "Microbiology",
        "Physics",
        "Statistics",
      ],
    },
    {
      code: "IMSU_SOCSCI_NG",
      name: "Faculty of Social Sciences",
      departments: [
        "Economics",
        "Geography",
        "Political Science",
        "Psychology",
        "Sociology",
      ],
    },
  ],
  UNILAG_NG: [
    {
      code: "UNILAG_ARTS_NG",
      name: "Faculty of Arts",
      departments: [
        "Creative Arts",
        "English",
        "European Languages and Integration Studies",
        "History and Strategic Studies",
        "Linguistics, African and Asian Studies",
        "Philosophy",
      ],
    },
    {
      code: "UNILAG_BMS_NG",
      name: "Faculty of Basic Medical Sciences",
      departments: ["Anatomy", "Biochemistry", "Physiology"],
    },
    {
      code: "UNILAG_CMS_NG",
      name: "Faculty of Clinical Sciences",
      departments: [
        "Medicine",
        "Surgery",
        "Paediatrics",
        "Obstetrics and Gynaecology",
      ],
    },
    {
      code: "UNILAG_EDU_NG",
      name: "Faculty of Education",
      departments: [
        "Arts and Social Sciences Education",
        "Educational Administration",
        "Science and Resource Education",
        "Special Education",
      ],
    },
    {
      code: "UNILAG_ENG_NG",
      name: "Faculty of Engineering",
      departments: [
        "Chemical and Polymer Engineering",
        "Civil and Environmental Engineering",
        "Electrical and Electronics Engineering",
        "Mechanical Engineering",
        "Metallurgical and Materials Engineering",
        "Systems Engineering",
      ],
    },
    {
      code: "UNILAG_ENV_NG",
      name: "Faculty of Environmental Sciences",
      departments: [
        "Architecture",
        "Building",
        "Estate Management",
        "Quantity Surveying",
        "Surveying and Geoinformatics",
        "Urban and Regional Planning",
      ],
    },
    {
      code: "UNILAG_LAW_NG",
      name: "Faculty of Law",
      departments: [
        "Public Law",
        "Private and Property Law",
        "International and Jurisprudence",
      ],
    },
    {
      code: "UNILAG_MGMT_NG",
      name: "Faculty of Management Sciences",
      departments: [
        "Actuarial Science and Insurance",
        "Accounting",
        "Banking and Finance",
        "Business Administration",
        "Industrial Relations and Personnel Management",
      ],
    },
    {
      code: "UNILAG_SCI_NG",
      name: "Faculty of Science",
      departments: [
        "Biochemistry",
        "Botany",
        "Chemistry",
        "Computer Science",
        "Geosciences",
        "Mathematics",
        "Microbiology",
        "Physics",
        "Zoology",
      ],
    },
    {
      code: "UNILAG_SOCSCI_NG",
      name: "Faculty of Social Sciences",
      departments: [
        "Economics",
        "Geography",
        "Mass Communication",
        "Political Science",
        "Psychology",
        "Sociology",
      ],
    },
  ],
};
