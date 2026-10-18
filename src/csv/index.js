// src/csv/index.js
import grammar from "./english-grammar.csv?raw";
import aptitude from "./aptitude.csv?raw";

export const csvFiles = [
  { name: "english-grammar.csv", raw: grammar },
  { name: "aptitude.csv", raw: aptitude }
];