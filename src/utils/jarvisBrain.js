// src/utils/jarvisBrain.js

export function getSystemContext() {
  // 1. Check Routine
  const routine = JSON.parse(localStorage.getItem("jarvis_routine") || "[]");
  const lastRoutineDate = localStorage.getItem("jarvis_last_routine_date");
  let routineMsg = "";
  
  if (!lastRoutineDate) {
    routineMsg = "You have not set a routine yet.";
  } else {
    const daysSince = Math.floor((Date.now() - new Date(lastRoutineDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 7) {
      routineMsg = `You haven't updated your routine in ${daysSince} days.`;
    }
  }

  // 2. Check Weight
  const weight = localStorage.getItem("jarvis_weight") || "80";
  const weightMsg = `Your last recorded weight was ${weight} kg.`;

  return { routineMsg, weightMsg, weight, hasRoutine: !!routine.length };
}

export function saveWeight(kg) {
  localStorage.setItem("jarvis_weight", kg);
  localStorage.setItem("jarvis_weight_date", new Date().toISOString());
}

export function saveRoutine(routineData) {
  localStorage.setItem("jarvis_routine", JSON.stringify(routineData));
  localStorage.setItem("jarvis_last_routine_date", new Date().toISOString());
}