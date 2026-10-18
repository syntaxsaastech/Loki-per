// src/csv/index.js
import grammar from "./english-grammar.csv?raw";
import aptitude from "./aptitude.csv?raw";
import medical from "./medicaldata.csv?raw"; // 👈 Check this line exists!

export const csvFiles = [
  { name: "english-grammar.csv", raw: grammar },
  { name: "aptitude.csv", raw: aptitude },
  { name: "medicaldata.csv", raw: medical } // 👈 Check this line exists!
];