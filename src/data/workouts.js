// ============================================================
// WORKOUT DATABASE — 200+ exercises
// Each exercise has: id, name, category, muscle, equipment, MET
// MET = Metabolic Equivalent (used to calculate calories burned)
// Calories = MET × weight(kg) × duration(hours)
// ============================================================

export const WORKOUT_DATABASE = [
  // ============ CHEST (20) ============
  { id: "pushup", name: "Push-ups", category: "Chest", muscle: "Pectorals", equipment: "None", MET: 8.0 },
  { id: "pushup_knee", name: "Knee Push-ups", category: "Chest", muscle: "Pectorals", equipment: "None", MET: 5.0 },
  { id: "pushup_diamond", name: "Diamond Push-ups", category: "Chest", muscle: "Triceps, Chest", equipment: "None", MET: 8.0 },
  { id: "pushup_wide", name: "Wide Push-ups", category: "Chest", muscle: "Outer Chest", equipment: "None", MET: 8.0 },
  { id: "pushup_incline", name: "Incline Push-ups", category: "Chest", muscle: "Upper Chest", equipment: "Bench", MET: 6.0 },
  { id: "pushup_decline", name: "Decline Push-ups", category: "Chest", muscle: "Upper Chest", equipment: "Bench", MET: 8.0 },
  { id: "bench_press", name: "Barbell Bench Press", category: "Chest", muscle: "Pectorals", equipment: "Barbell", MET: 6.0 },
  { id: "dumbbell_press", name: "Dumbbell Bench Press", category: "Chest", muscle: "Pectorals", equipment: "Dumbbells", MET: 6.0 },
  { id: "incline_press", name: "Incline Bench Press", category: "Chest", muscle: "Upper Chest", equipment: "Barbell", MET: 6.0 },
  { id: "decline_press", name: "Decline Bench Press", category: "Chest", muscle: "Lower Chest", equipment: "Barbell", MET: 6.0 },
  { id: "chest_fly", name: "Dumbbell Chest Fly", category: "Chest", muscle: "Pectorals", equipment: "Dumbbells", MET: 5.0 },
  { id: "cable_fly", name: "Cable Chest Fly", category: "Chest", muscle: "Pectorals", equipment: "Cable", MET: 5.0 },
  { id: "pec_deck", name: "Pec Deck Machine", category: "Chest", muscle: "Pectorals", equipment: "Machine", MET: 4.5 },
  { id: "dips_chest", name: "Chest Dips", category: "Chest", muscle: "Lower Chest", equipment: "Bars", MET: 8.0 },
  { id: "pullover", name: "Dumbbell Pullover", category: "Chest", muscle: "Chest, Lats", equipment: "Dumbbell", MET: 5.0 },
  { id: "floor_press", name: "Floor Press", category: "Chest", muscle: "Pectorals", equipment: "Barbell", MET: 5.5 },
  { id: "svend_press", name: "Svend Press", category: "Chest", muscle: "Inner Chest", equipment: "Plate", MET: 4.5 },
  { id: "landmine_press", name: "Landmine Press", category: "Chest", muscle: "Upper Chest", equipment: "Barbell", MET: 5.5 },
  { id: "push_up_burpee", name: "Push-up Burpees", category: "Chest", muscle: "Full Body", equipment: "None", MET: 10.0 },
  { id: "clap_pushup", name: "Clap Push-ups", category: "Chest", muscle: "Chest, Power", equipment: "None", MET: 10.0 },

  // ============ BACK (25) ============
  { id: "pullup", name: "Pull-ups", category: "Back", muscle: "Lats", equipment: "Bar", MET: 8.0 },
  { id: "chinup", name: "Chin-ups", category: "Back", muscle: "Lats, Biceps", equipment: "Bar", MET: 8.0 },
  { id: "assisted_pullup", name: "Assisted Pull-ups", category: "Back", muscle: "Lats", equipment: "Machine", MET: 6.0 },
  { id: "lat_pulldown", name: "Lat Pulldown", category: "Back", muscle: "Lats", equipment: "Cable", MET: 5.0 },
  { id: "seated_row", name: "Seated Cable Row", category: "Back", muscle: "Mid Back", equipment: "Cable", MET: 5.0 },
  { id: "barbell_row", name: "Barbell Row", category: "Back", muscle: "Mid Back", equipment: "Barbell", MET: 6.0 },
  { id: "dumbbell_row", name: "One-Arm Dumbbell Row", category: "Back", muscle: "Lats", equipment: "Dumbbell", MET: 6.0 },
  { id: "tbar_row", name: "T-Bar Row", category: "Back", muscle: "Mid Back", equipment: "Barbell", MET: 6.0 },
  { id: "pendlay_row", name: "Pendlay Row", category: "Back", muscle: "Mid Back", equipment: "Barbell", MET: 6.5 },
  { id: "face_pull", name: "Face Pulls", category: "Back", muscle: "Rear Delts", equipment: "Cable", MET: 4.5 },
  { id: "straight_arm", name: "Straight-Arm Pulldown", category: "Back", muscle: "Lats", equipment: "Cable", MET: 4.5 },
  { id: "deadlift", name: "Deadlift", category: "Back", muscle: "Full Back", equipment: "Barbell", MET: 6.0 },
  { id: "romanian_dl", name: "Romanian Deadlift", category: "Back", muscle: "Lower Back, Hamstrings", equipment: "Barbell", MET: 6.0 },
  { id: "sumo_dl", name: "Sumo Deadlift", category: "Back", muscle: "Back, Legs", equipment: "Barbell", MET: 6.5 },
  { id: "rack_pull", name: "Rack Pulls", category: "Back", muscle: "Upper Back", equipment: "Barbell", MET: 5.5 },
  { id: "hyperextension", name: "Hyperextension", category: "Back", muscle: "Lower Back", equipment: "Machine", MET: 4.5 },
  { id: "good_morning", name: "Good Mornings", category: "Back", muscle: "Lower Back", equipment: "Barbell", MET: 5.0 },
  { id: "inverted_row", name: "Inverted Rows", category: "Back", muscle: "Mid Back", equipment: "Bar", MET: 6.0 },
  { id: "superman", name: "Superman Hold", category: "Back", muscle: "Lower Back", equipment: "None", MET: 3.5 },
  { id: "reverse_fly", name: "Reverse Fly", category: "Back", muscle: "Rear Delts", equipment: "Dumbbells", MET: 4.5 },
  { id: "shrugs", name: "Barbell Shrugs", category: "Back", muscle: "Traps", equipment: "Barbell", MET: 4.5 },
  { id: "dumbbell_shrug", name: "Dumbbell Shrugs", category: "Back", muscle: "Traps", equipment: "Dumbbells", MET: 4.5 },
  { id: "farmer_walk", name: "Farmer's Walk", category: "Back", muscle: "Traps, Grip", equipment: "Dumbbells", MET: 5.5 },
  { id: "back_extension", name: "Back Extension", category: "Back", muscle: "Lower Back", equipment: "Bench", MET: 4.0 },
  { id: "bird_dog", name: "Bird Dog", category: "Back", muscle: "Core, Back", equipment: "None", MET: 3.5 },

  // ============ SHOULDERS (18) ============
  { id: "overhead_press", name: "Overhead Press", category: "Shoulders", muscle: "Front Delts", equipment: "Barbell", MET: 5.5 },
  { id: "dumbbell_press_shoulder", name: "Dumbbell Shoulder Press", category: "Shoulders", muscle: "Front Delts", equipment: "Dumbbells", MET: 5.0 },
  { id: "arnold_press", name: "Arnold Press", category: "Shoulders", muscle: "All Delts", equipment: "Dumbbells", MET: 5.5 },
  { id: "lateral_raise", name: "Lateral Raise", category: "Shoulders", muscle: "Side Delts", equipment: "Dumbbells", MET: 4.5 },
  { id: "front_raise", name: "Front Raise", category: "Shoulders", muscle: "Front Delts", equipment: "Dumbbells", MET: 4.5 },
  { id: "rear_delt_fly", name: "Rear Delt Fly", category: "Shoulders", muscle: "Rear Delts", equipment: "Dumbbells", MET: 4.5 },
  { id: "upright_row", name: "Upright Row", category: "Shoulders", muscle: "Side Delts, Traps", equipment: "Barbell", MET: 5.0 },
  { id: "cable_lateral", name: "Cable Lateral Raise", category: "Shoulders", muscle: "Side Delts", equipment: "Cable", MET: 4.5 },
  { id: "pike_pushup", name: "Pike Push-ups", category: "Shoulders", muscle: "Front Delts", equipment: "None", MET: 6.5 },
  { id: "handstand_pushup", name: "Handstand Push-ups", category: "Shoulders", muscle: "Front Delts", equipment: "None", MET: 10.0 },
  { id: "plate_raise", name: "Plate Front Raise", category: "Shoulders", muscle: "Front Delts", equipment: "Plate", MET: 4.0 },
  { id: "machine_press", name: "Machine Shoulder Press", category: "Shoulders", muscle: "Front Delts", equipment: "Machine", MET: 4.5 },
  { id: "cuban_press", name: "Cuban Press", category: "Shoulders", muscle: "Rotator Cuff", equipment: "Dumbbells", MET: 4.0 },
  { id: "y_raise", name: "Y-Raise", category: "Shoulders", muscle: "Rear Delts", equipment: "Dumbbells", MET: 4.0 },
  { id: "bus_driver", name: "Bus Driver", category: "Shoulders", muscle: "All Delts", equipment: "Plate", MET: 4.0 },
  { id: "around_world", name: "Around the World", category: "Shoulders", muscle: "All Delts", equipment: "Dumbbells", MET: 4.5 },
  { id: "smith_press", name: "Smith Machine Press", category: "Shoulders", muscle: "Front Delts", equipment: "Machine", MET: 4.5 },
  { id: "landmine_lateral", name: "Landmine Lateral Raise", category: "Shoulders", muscle: "Side Delts", equipment: "Barbell", MET: 4.5 },

  // ============ BICEPS (15) ============
  { id: "barbell_curl", name: "Barbell Curl", category: "Biceps", muscle: "Biceps", equipment: "Barbell", MET: 4.0 },
  { id: "dumbbell_curl", name: "Dumbbell Curl", category: "Biceps", muscle: "Biceps", equipment: "Dumbbells", MET: 4.0 },
  { id: "hammer_curl", name: "Hammer Curl", category: "Biceps", muscle: "Brachialis", equipment: "Dumbbells", MET: 4.0 },
  { id: "preacher_curl", name: "Preacher Curl", category: "Biceps", muscle: "Biceps", equipment: "Barbell", MET: 4.0 },
  { id: "concentration_curl", name: "Concentration Curl", category: "Biceps", muscle: "Biceps Peak", equipment: "Dumbbell", MET: 4.0 },
  { id: "incline_curl", name: "Incline Dumbbell Curl", category: "Biceps", muscle: "Long Head", equipment: "Dumbbells", MET: 4.0 },
  { id: "cable_curl", name: "Cable Curl", category: "Biceps", muscle: "Biceps", equipment: "Cable", MET: 4.0 },
  { id: "reverse_curl", name: "Reverse Curl", category: "Biceps", muscle: "Forearms", equipment: "Barbell", MET: 4.0 },
  { id: "spider_curl", name: "Spider Curl", category: "Biceps", muscle: "Biceps", equipment: "Dumbbells", MET: 4.0 },
  { id: "21s", name: "21s Curl", category: "Biceps", muscle: "Biceps", equipment: "Barbell", MET: 4.5 },
  { id: "drag_curl", name: "Drag Curl", category: "Biceps", muscle: "Biceps", equipment: "Barbell", MET: 4.0 },
  { id: "zottman_curl", name: "Zottman Curl", category: "Biceps", muscle: "Biceps, Forearms", equipment: "Dumbbells", MET: 4.0 },
  { id: "chinup_biceps", name: "Close-Grip Chin-ups", category: "Biceps", muscle: "Biceps", equipment: "Bar", MET: 8.0 },
  { id: "isometric_curl", name: "Isometric Curl Hold", category: "Biceps", muscle: "Biceps", equipment: "Dumbbell", MET: 3.5 },
  { id: "band_curl", name: "Resistance Band Curl", category: "Biceps", muscle: "Biceps", equipment: "Band", MET: 3.5 },

  // ============ TRICEPS (15) ============
  { id: "tricep_dips", name: "Tricep Dips", category: "Triceps", muscle: "Triceps", equipment: "Bars", MET: 8.0 },
  { id: "bench_dips", name: "Bench Dips", category: "Triceps", muscle: "Triceps", equipment: "Bench", MET: 5.0 },
  { id: "skull_crusher", name: "Skull Crushers", category: "Triceps", muscle: "Triceps", equipment: "Barbell", MET: 4.5 },
  { id: "overhead_ext", name: "Overhead Tricep Extension", category: "Triceps", muscle: "Long Head", equipment: "Dumbbell", MET: 4.0 },
  { id: "pushdown", name: "Tricep Pushdown", category: "Triceps", muscle: "Triceps", equipment: "Cable", MET: 4.0 },
  { id: "rope_pushdown", name: "Rope Pushdown", category: "Triceps", muscle: "Triceps", equipment: "Cable", MET: 4.0 },
  { id: "kickback", name: "Tricep Kickback", category: "Triceps", muscle: "Triceps", equipment: "Dumbbell", MET: 3.5 },
  { id: "close_grip_press", name: "Close-Grip Bench Press", category: "Triceps", muscle: "Triceps", equipment: "Barbell", MET: 5.5 },
  { id: "tricep_pushup", name: "Tricep Push-ups", category: "Triceps", muscle: "Triceps", equipment: "None", MET: 8.0 },
  { id: "dumbbell_ext", name: "Dumbbell Tricep Extension", category: "Triceps", muscle: "Triceps", equipment: "Dumbbells", MET: 4.0 },
  { id: "cable_overhead", name: "Cable Overhead Extension", category: "Triceps", muscle: "Long Head", equipment: "Cable", MET: 4.0 },
  { id: "reverse_pushdown", name: "Reverse-Grip Pushdown", category: "Triceps", muscle: "Medial Head", equipment: "Cable", MET: 4.0 },
  { id: "tate_press", name: "Tate Press", category: "Triceps", muscle: "Triceps", equipment: "Dumbbells", MET: 4.0 },
  { id: "jm_press", name: "JM Press", category: "Triceps", muscle: "Triceps", equipment: "Barbell", MET: 5.0 },
  { id: "band_pushdown", name: "Band Pushdown", category: "Triceps", muscle: "Triceps", equipment: "Band", MET: 3.5 },

  // ============ FOREARMS (6) ============
  { id: "wrist_curl", name: "Wrist Curl", category: "Forearms", muscle: "Forearms", equipment: "Dumbbell", MET: 3.0 },
  { id: "reverse_wrist", name: "Reverse Wrist Curl", category: "Forearms", muscle: "Forearms", equipment: "Dumbbell", MET: 3.0 },
  { id: "farmers_carry", name: "Farmer's Carry", category: "Forearms", muscle: "Grip", equipment: "Dumbbells", MET: 5.5 },
  { id: "dead_hang", name: "Dead Hang", category: "Forearms", muscle: "Grip", equipment: "Bar", MET: 4.0 },
  { id: "plate_pinch", name: "Plate Pinch", category: "Forearms", muscle: "Grip", equipment: "Plate", MET: 3.5 },
  { id: "wrist_roller", name: "Wrist Roller", category: "Forearms", muscle: "Forearms", equipment: "Tool", MET: 4.0 },

  // ============ CORE / ABS (30) ============
  { id: "crunch", name: "Crunches", category: "Core", muscle: "Upper Abs", equipment: "None", MET: 3.8 },
  { id: "situp", name: "Sit-ups", category: "Core", muscle: "Abs", equipment: "None", MET: 4.5 },
  { id: "plank", name: "Plank", category: "Core", muscle: "Core", equipment: "None", MET: 3.5 },
  { id: "side_plank", name: "Side Plank", category: "Core", muscle: "Obliques", equipment: "None", MET: 3.5 },
  { id: "russian_twist", name: "Russian Twist", category: "Core", muscle: "Obliques", equipment: "None", MET: 4.5 },
  { id: "bicycle_crunch", name: "Bicycle Crunch", category: "Core", muscle: "Obliques", equipment: "None", MET: 5.0 },
  { id: "leg_raise", name: "Leg Raises", category: "Core", muscle: "Lower Abs", equipment: "None", MET: 5.0 },
  { id: "hanging_leg_raise", name: "Hanging Leg Raise", category: "Core", muscle: "Lower Abs", equipment: "Bar", MET: 6.0 },
  { id: "mountain_climber", name: "Mountain Climbers", category: "Core", muscle: "Core, Cardio", equipment: "None", MET: 8.0 },
  { id: "dead_bug", name: "Dead Bug", category: "Core", muscle: "Deep Core", equipment: "None", MET: 3.5 },
  { id: "flutter_kick", name: "Flutter Kicks", category: "Core", muscle: "Lower Abs", equipment: "None", MET: 5.0 },
  { id: "v_up", name: "V-Ups", category: "Core", muscle: "Full Core", equipment: "None", MET: 6.0 },
  { id: "toe_touch", name: "Toe Touches", category: "Core", muscle: "Upper Abs", equipment: "None", MET: 4.0 },
  { id: "reverse_crunch", name: "Reverse Crunch", category: "Core", muscle: "Lower Abs", equipment: "None", MET: 4.5 },
  { id: "hollow_hold", name: "Hollow Body Hold", category: "Core", muscle: "Full Core", equipment: "None", MET: 4.0 },
  { id: "ab_wheel", name: "Ab Wheel Rollout", category: "Core", muscle: "Core", equipment: "Ab Wheel", MET: 5.0 },
  { id: "cable_crunch", name: "Cable Crunch", category: "Core", muscle: "Upper Abs", equipment: "Cable", MET: 4.0 },
  { id: "wood_chop", name: "Cable Wood Chop", category: "Core", muscle: "Obliques", equipment: "Cable", MET: 4.5 },
  { id: "pallof_press", name: "Pallof Press", category: "Core", muscle: "Deep Core", equipment: "Cable", MET: 4.0 },
  { id: "bird_dog_core", name: "Bird Dog (Core)", category: "Core", muscle: "Deep Core", equipment: "None", MET: 3.5 },
  { id: "dragon_flag", name: "Dragon Flag", category: "Core", muscle: "Full Core", equipment: "Bench", MET: 7.0 },
  { id: "l_sit", name: "L-Sit Hold", category: "Core", muscle: "Core", equipment: "Bars", MET: 6.0 },
  { id: "windshield_wiper", name: "Windshield Wipers", category: "Core", muscle: "Obliques", equipment: "Bar", MET: 6.5 },
  { id: "hollow_rock", name: "Hollow Rocks", category: "Core", muscle: "Full Core", equipment: "None", MET: 5.0 },
  { id: "plank_shoulder_tap", name: "Plank Shoulder Taps", category: "Core", muscle: "Core", equipment: "None", MET: 5.0 },
  { id: "plank_up_down", name: "Plank Up-Downs", category: "Core", muscle: "Core", equipment: "None", MET: 6.0 },
  { id: "bicycle_hold", name: "Bicycle Hold", category: "Core", muscle: "Obliques", equipment: "None", MET: 4.0 },
  { id: "scissor_kick", name: "Scissor Kicks", category: "Core", muscle: "Lower Abs", equipment: "None", MET: 5.0 },
  { id: "jackknife", name: "Jackknife Sit-up", category: "Core", muscle: "Full Core", equipment: "None", MET: 5.5 },
  { id: "side_bend", name: "Dumbbell Side Bend", category: "Core", muscle: "Obliques", equipment: "Dumbbell", MET: 3.5 },

  // ============ LEGS — QUADS (20) ============
  { id: "squat", name: "Barbell Back Squat", category: "Legs", muscle: "Quads, Glutes", equipment: "Barbell", MET: 6.0 },
  { id: "front_squat", name: "Front Squat", category: "Legs", muscle: "Quads", equipment: "Barbell", MET: 6.5 },
  { id: "goblet_squat", name: "Goblet Squat", category: "Legs", muscle: "Quads", equipment: "Dumbbell", MET: 5.5 },
  { id: "bodyweight_squat", name: "Bodyweight Squat", category: "Legs", muscle: "Quads", equipment: "None", MET: 4.5 },
  { id: "jump_squat", name: "Jump Squats", category: "Legs", muscle: "Quads, Power", equipment: "None", MET: 8.0 },
  { id: "pistol_squat", name: "Pistol Squats", category: "Legs", muscle: "Quads", equipment: "None", MET: 7.5 },
  { id: "bulgarian_split", name: "Bulgarian Split Squat", category: "Legs", muscle: "Quads, Glutes", equipment: "Dumbbells", MET: 6.0 },
  { id: "lunge", name: "Walking Lunges", category: "Legs", muscle: "Quads, Glutes", equipment: "None", MET: 5.5 },
  { id: "reverse_lunge", name: "Reverse Lunges", category: "Legs", muscle: "Quads", equipment: "None", MET: 5.5 },
  { id: "lateral_lunge", name: "Lateral Lunges", category: "Legs", muscle: "Quads, Adductors", equipment: "None", MET: 5.5 },
  { id: "leg_press", name: "Leg Press", category: "Legs", muscle: "Quads", equipment: "Machine", MET: 5.0 },
  { id: "leg_ext", name: "Leg Extension", category: "Legs", muscle: "Quads", equipment: "Machine", MET: 4.0 },
  { id: "hack_squat", name: "Hack Squat", category: "Legs", muscle: "Quads", equipment: "Machine", MET: 6.0 },
  { id: "step_up", name: "Step-ups", category: "Legs", muscle: "Quads, Glutes", equipment: "Box", MET: 5.5 },
  { id: "wall_sit", name: "Wall Sit", category: "Legs", muscle: "Quads", equipment: "None", MET: 4.0 },
  { id: "sissy_squat", name: "Sissy Squat", category: "Legs", muscle: "Quads", equipment: "None", MET: 6.0 },
  { id: "box_squat", name: "Box Squat", category: "Legs", muscle: "Quads", equipment: "Barbell", MET: 5.5 },
  { id: "zercher_squat", name: "Zercher Squat", category: "Legs", muscle: "Quads", equipment: "Barbell", MET: 6.0 },
  { id: "smith_squat", name: "Smith Machine Squat", category: "Legs", muscle: "Quads", equipment: "Machine", MET: 5.5 },
  { id: "belt_squat", name: "Belt Squat", category: "Legs", muscle: "Quads", equipment: "Machine", MET: 5.5 },

  // ============ LEGS — HAMSTRINGS & GLUTES (20) ============
  { id: "rdl_leg", name: "Romanian Deadlift", category: "Legs", muscle: "Hamstrings", equipment: "Barbell", MET: 6.0 },
  { id: "leg_curl", name: "Lying Leg Curl", category: "Legs", muscle: "Hamstrings", equipment: "Machine", MET: 4.0 },
  { id: "seated_leg_curl", name: "Seated Leg Curl", category: "Legs", muscle: "Hamstrings", equipment: "Machine", MET: 4.0 },
  { id: "nordic_curl", name: "Nordic Curl", category: "Legs", muscle: "Hamstrings", equipment: "None", MET: 7.0 },
  { id: "good_morning_leg", name: "Good Mornings", category: "Legs", muscle: "Hamstrings", equipment: "Barbell", MET: 5.0 },
  { id: "hip_thrust", name: "Barbell Hip Thrust", category: "Legs", muscle: "Glutes", equipment: "Barbell", MET: 5.0 },
  { id: "glute_bridge", name: "Glute Bridge", category: "Legs", muscle: "Glutes", equipment: "None", MET: 4.0 },
  { id: "single_glute_bridge", name: "Single-Leg Glute Bridge", category: "Legs", muscle: "Glutes", equipment: "None", MET: 5.0 },
  { id: "cable_kickback", name: "Cable Glute Kickback", category: "Legs", muscle: "Glutes", equipment: "Cable", MET: 4.0 },
  { id: "donkey_kick", name: "Donkey Kicks", category: "Legs", muscle: "Glutes", equipment: "None", MET: 4.0 },
  { id: "fire_hydrant", name: "Fire Hydrants", category: "Legs", muscle: "Glutes", equipment: "None", MET: 4.0 },
  { id: "clamshell", name: "Clamshells", category: "Legs", muscle: "Glutes", equipment: "Band", MET: 3.5 },
  { id: "sumo_squat", name: "Sumo Squat", category: "Legs", muscle: "Glutes, Inner Thigh", equipment: "Dumbbell", MET: 5.5 },
  { id: "curtsy_lunge", name: "Curtsy Lunges", category: "Legs", muscle: "Glutes", equipment: "Dumbbells", MET: 5.5 },
  { id: "hip_abduction", name: "Hip Abduction Machine", category: "Legs", muscle: "Glutes", equipment: "Machine", MET: 3.5 },
  { id: "cable_pull_through", name: "Cable Pull-Through", category: "Legs", muscle: "Glutes", equipment: "Cable", MET: 4.5 },
  { id: "kb_swing", name: "Kettlebell Swing", category: "Legs", muscle: "Glutes, Hamstrings", equipment: "Kettlebell", MET: 9.8 },
  { id: "step_up_glute", name: "Glute-Focused Step-ups", category: "Legs", muscle: "Glutes", equipment: "Box", MET: 5.5 },
  { id: "reverse_hyper", name: "Reverse Hyperextension", category: "Legs", muscle: "Glutes, Hamstrings", equipment: "Machine", MET: 4.5 },
  { id: "frog_pump", name: "Frog Pumps", category: "Legs", muscle: "Glutes", equipment: "None", MET: 4.0 },

  // ============ CALVES (8) ============
  { id: "standing_calf", name: "Standing Calf Raise", category: "Calves", muscle: "Calves", equipment: "Machine", MET: 3.5 },
  { id: "seated_calf", name: "Seated Calf Raise", category: "Calves", muscle: "Soleus", equipment: "Machine", MET: 3.0 },
  { id: "bw_calf_raise", name: "Bodyweight Calf Raise", category: "Calves", muscle: "Calves", equipment: "None", MET: 3.0 },
  { id: "donkey_calf", name: "Donkey Calf Raise", category: "Calves", muscle: "Calves", equipment: "Machine", MET: 3.5 },
  { id: "single_calf", name: "Single-Leg Calf Raise", category: "Calves", muscle: "Calves", equipment: "Dumbbell", MET: 3.5 },
  { id: "smith_calf", name: "Smith Machine Calf Raise", category: "Calves", muscle: "Calves", equipment: "Machine", MET: 3.5 },
  { id: "jump_rope_calf", name: "Jump Rope (Calf Focus)", category: "Calves", muscle: "Calves", equipment: "Rope", MET: 10.0 },
  { id: "farmers_walk_calf", name: "Calf Raise Walk", category: "Calves", muscle: "Calves", equipment: "None", MET: 4.0 },

  // ============ CARDIO (25) ============
  { id: "running_6mph", name: "Running (6 mph)", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 9.8 },
  { id: "running_8mph", name: "Running (8 mph)", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 11.8 },
  { id: "jogging", name: "Jogging", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 7.0 },
  { id: "walking_brisk", name: "Brisk Walking", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 4.3 },
  { id: "walking_slow", name: "Slow Walking", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 2.5 },
  { id: "cycling_light", name: "Cycling (Light)", category: "Cardio", muscle: "Legs", equipment: "Bike", MET: 5.8 },
  { id: "cycling_vigorous", name: "Cycling (Vigorous)", category: "Cardio", muscle: "Legs", equipment: "Bike", MET: 10.0 },
  { id: "stationary_bike", name: "Stationary Bike", category: "Cardio", muscle: "Legs", equipment: "Bike", MET: 7.0 },
  { id: "elliptical", name: "Elliptical Trainer", category: "Cardio", muscle: "Full Body", equipment: "Machine", MET: 5.0 },
  { id: "rowing", name: "Rowing Machine", category: "Cardio", muscle: "Full Body", equipment: "Machine", MET: 7.0 },
  { id: "stair_climber", name: "Stair Climber", category: "Cardio", muscle: "Legs", equipment: "Machine", MET: 9.0 },
  { id: "jump_rope", name: "Jump Rope", category: "Cardio", muscle: "Full Body", equipment: "Rope", MET: 12.3 },
  { id: "burpees", name: "Burpees", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 8.0 },
  { id: "jumping_jacks", name: "Jumping Jacks", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 8.0 },
  { id: "high_knees", name: "High Knees", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 8.0 },
  { id: "box_jumps", name: "Box Jumps", category: "Cardio", muscle: "Legs, Power", equipment: "Box", MET: 9.0 },
  { id: "swimming_laps", name: "Swimming Laps", category: "Cardio", muscle: "Full Body", equipment: "Pool", MET: 8.0 },
  { id: "swimming_butterfly", name: "Butterfly Stroke", category: "Cardio", muscle: "Full Body", equipment: "Pool", MET: 13.8 },
  { id: "battle_ropes", name: "Battle Ropes", category: "Cardio", muscle: "Arms, Core", equipment: "Rope", MET: 10.0 },
  { id: "shadow_boxing", name: "Shadow Boxing", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 7.8 },
  { id: "heavy_bag", name: "Heavy Bag Boxing", category: "Cardio", muscle: "Full Body", equipment: "Bag", MET: 5.5 },
  { id: "dancing", name: "Dancing (Freestyle)", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 5.0 },
  { id: "zumba", name: "Zumba", category: "Cardio", muscle: "Full Body", equipment: "None", MET: 6.5 },
  { id: "hiking", name: "Hiking", category: "Cardio", muscle: "Full Body", equipment: "Trail", MET: 6.0 },
  { id: "rock_climbing", name: "Rock Climbing", category: "Cardio", muscle: "Full Body", equipment: "Wall", MET: 8.0 },

  // ============ FLEXIBILITY / YOGA (20) ============
  { id: "yoga_hatha", name: "Hatha Yoga", category: "Yoga", muscle: "Full Body", equipment: "Mat", MET: 2.5 },
  { id: "yoga_vinyasa", name: "Vinyasa Yoga", category: "Yoga", muscle: "Full Body", equipment: "Mat", MET: 4.0 },
  { id: "yoga_power", name: "Power Yoga", category: "Yoga", muscle: "Full Body", equipment: "Mat", MET: 4.0 },
  { id: "yoga_bikram", name: "Bikram Yoga", category: "Yoga", muscle: "Full Body", equipment: "Mat", MET: 5.0 },
  { id: "surya_namaskar", name: "Surya Namaskar (Sun Salutation)", category: "Yoga", muscle: "Full Body", equipment: "Mat", MET: 4.0 },
  { id: "child_pose", name: "Child's Pose", category: "Yoga", muscle: "Back", equipment: "Mat", MET: 1.5 },
  { id: "downward_dog", name: "Downward Dog", category: "Yoga", muscle: "Full Body", equipment: "Mat", MET: 2.5 },
  { id: "warrior_1", name: "Warrior I", category: "Yoga", muscle: "Legs, Core", equipment: "Mat", MET: 3.0 },
  { id: "warrior_2", name: "Warrior II", category: "Yoga", muscle: "Legs, Core", equipment: "Mat", MET: 3.0 },
  { id: "tree_pose", name: "Tree Pose", category: "Yoga", muscle: "Balance", equipment: "Mat", MET: 2.0 },
  { id: "pigeon_pose", name: "Pigeon Pose", category: "Yoga", muscle: "Hips", equipment: "Mat", MET: 2.0 },
  { id: "cobra_pose", name: "Cobra Pose", category: "Yoga", muscle: "Back", equipment: "Mat", MET: 2.0 },
  { id: "bridge_pose", name: "Bridge Pose", category: "Yoga", muscle: "Back, Glutes", equipment: "Mat", MET: 2.5 },
  { id: "corpse_pose", name: "Corpse Pose (Savasana)", category: "Yoga", muscle: "Relaxation", equipment: "Mat", MET: 1.0 },
  { id: "stretching", name: "General Stretching", category: "Flexibility", muscle: "Full Body", equipment: "None", MET: 2.3 },
  { id: "dynamic_stretch", name: "Dynamic Stretching", category: "Flexibility", muscle: "Full Body", equipment: "None", MET: 3.0 },
  { id: "static_stretch", name: "Static Stretching", category: "Flexibility", muscle: "Full Body", equipment: "None", MET: 2.3 },
  { id: "mobility_flow", name: "Mobility Flow", category: "Flexibility", muscle: "Full Body", equipment: "Mat", MET: 2.5 },
  { id: "foam_rolling", name: "Foam Rolling", category: "Flexibility", muscle: "Recovery", equipment: "Foam Roller", MET: 2.0 },
  { id: "pilates", name: "Pilates", category: "Flexibility", muscle: "Core", equipment: "Mat", MET: 3.0 },

  // ============ HIIT / FUNCTIONAL (15) ============
  { id: "hiit_30_30", name: "HIIT (30s work / 30s rest)", category: "HIIT", muscle: "Full Body", equipment: "None", MET: 10.0 },
  { id: "hiit_40_20", name: "HIIT (40s work / 20s rest)", category: "HIIT", muscle: "Full Body", equipment: "None", MET: 12.0 },
  { id: "tabata", name: "Tabata (20/10 × 8)", category: "HIIT", muscle: "Full Body", equipment: "None", MET: 12.0 },
  { id: "crossfit_wod", name: "CrossFit WOD", category: "HIIT", muscle: "Full Body", equipment: "Mixed", MET: 12.0 },
  { id: "circuit_training", name: "Circuit Training", category: "HIIT", muscle: "Full Body", equipment: "Mixed", MET: 8.0 },
  { id: "amrap", name: "AMRAP Circuit", category: "HIIT", muscle: "Full Body", equipment: "Mixed", MET: 10.0 },
  { id: "emom", name: "EMOM Circuit", category: "HIIT", muscle: "Full Body", equipment: "Mixed", MET: 10.0 },
  { id: "metcon", name: "MetCon", category: "HIIT", muscle: "Full Body", equipment: "Mixed", MET: 11.0 },
  { id: "kettlebell_complex", name: "Kettlebell Complex", category: "HIIT", muscle: "Full Body", equipment: "Kettlebell", MET: 10.0 },
  { id: "sprint_intervals", name: "Sprint Intervals", category: "HIIT", muscle: "Legs, Cardio", equipment: "None", MET: 13.5 },
  { id: "hill_sprints", name: "Hill Sprints", category: "HIIT", muscle: "Legs, Cardio", equipment: "Hill", MET: 15.0 },
  { id: "bear_crawl", name: "Bear Crawls", category: "HIIT", muscle: "Full Body", equipment: "None", MET: 8.0 },
  { id: "crab_walk", name: "Crab Walks", category: "HIIT", muscle: "Full Body", equipment: "None", MET: 7.0 },
  { id: "farmers_walk_hiit", name: "Weighted Carry Circuit", category: "HIIT", muscle: "Full Body", equipment: "Dumbbells", MET: 8.0 },
  { id: "duck_walk", name: "Duck Walks", category: "HIIT", muscle: "Legs", equipment: "None", MET: 6.0 },

  // ============ SPORTS (15) ============
  { id: "cricket", name: "Cricket", category: "Sports", muscle: "Full Body", equipment: "None", MET: 5.0 },
  { id: "football", name: "Football (Soccer)", category: "Sports", muscle: "Full Body", equipment: "Ball", MET: 7.0 },
  { id: "basketball", name: "Basketball", category: "Sports", muscle: "Full Body", equipment: "Ball", MET: 6.5 },
  { id: "tennis_singles", name: "Tennis (Singles)", category: "Sports", muscle: "Full Body", equipment: "Racket", MET: 8.0 },
  { id: "tennis_doubles", name: "Tennis (Doubles)", category: "Sports", muscle: "Full Body", equipment: "Racket", MET: 6.0 },
  { id: "badminton", name: "Badminton", category: "Sports", muscle: "Full Body", equipment: "Racket", MET: 5.5 },
  { id: "table_tennis", name: "Table Tennis", category: "Sports", muscle: "Arms", equipment: "Paddle", MET: 4.0 },
  { id: "squash", name: "Squash", category: "Sports", muscle: "Full Body", equipment: "Racket", MET: 12.0 },
  { id: "volleyball", name: "Volleyball", category: "Sports", muscle: "Full Body", equipment: "Ball", MET: 4.0 },
  { id: "hockey", name: "Field Hockey", category: "Sports", muscle: "Full Body", equipment: "Stick", MET: 7.8 },
  { id: "kabaddi", name: "Kabaddi", category: "Sports", muscle: "Full Body", equipment: "None", MET: 8.0 },
  { id: "kho_kho", name: "Kho Kho", category: "Sports", muscle: "Full Body", equipment: "None", MET: 7.5 },
  { id: "golf", name: "Golf (Walking)", category: "Sports", muscle: "Arms, Core", equipment: "Clubs", MET: 4.8 },
  { id: "skipping", name: "Skipping", category: "Sports", muscle: "Full Body", equipment: "Rope", MET: 12.3 },
  { id: "martial_arts", name: "Martial Arts (General)", category: "Sports", muscle: "Full Body", equipment: "None", MET: 10.3 },
];

// ============================================================
// HELPERS
// ============================================================

export const getWorkoutById = (id) =>
  WORKOUT_DATABASE.find((w) => w.id === id);

export const searchWorkouts = (query) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return WORKOUT_DATABASE.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.muscle.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.equipment.toLowerCase().includes(q)
  );
};

export const getWorkoutCategories = () => [
  ...new Set(WORKOUT_DATABASE.map((w) => w.category)),
];

export const getMuscleGroups = () => [
  ...new Set(WORKOUT_DATABASE.map((w) => w.muscle)),
];

export const getEquipmentTypes = () => [
  ...new Set(WORKOUT_DATABASE.map((w) => w.equipment)),
];

export const getWorkoutsByCategory = (category) =>
  WORKOUT_DATABASE.filter((w) => w.category === category);

export const getWorkoutsByMuscle = (muscle) =>
  WORKOUT_DATABASE.filter((w) => w.muscle.toLowerCase().includes(muscle.toLowerCase()));

// ---------- CALORIE CALCULATION ----------
/**
 * Calculate calories burned for a workout.
 * Formula: kcal = MET × weight(kg) × duration(hours)
 */
export const calculateCaloriesBurned = (workout, weightKg, minutes) => {
  if (!workout || !weightKg || !minutes) return 0;
  const hours = minutes / 60;
  return Math.round(workout.MET * weightKg * hours);
};

// ---------- RECOMMENDATIONS ----------
export const getRecommendedWorkouts = (muscleGroup, count = 5) => {
  const filtered = WORKOUT_DATABASE.filter((w) =>
    w.muscle.toLowerCase().includes(muscleGroup.toLowerCase())
  );
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
};

export const getQuickWorkout = (duration = 20) => {
  // Returns a random quick workout based on available time
  const suitable = WORKOUT_DATABASE.filter(
    (w) => w.MET > 5 && w.equipment === "None"
  );
  return suitable[Math.floor(Math.random() * suitable.length)];
};

// ---------- STATS ----------
export const getDatabaseStats = () => ({
  total: WORKOUT_DATABASE.length,
  categories: getWorkoutCategories().length,
  muscles: getMuscleGroups().length,
  equipmentTypes: getEquipmentTypes().length,
});