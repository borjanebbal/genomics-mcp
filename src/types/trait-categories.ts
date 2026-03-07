/**
 * Valid trait category names used to group traits in list_traits output.
 * Add new categories here — the TraitCategory type is derived automatically.
 */
export const TRAIT_CATEGORY = {
  Neurological: "Neurological",
  Behavioral: "Behavioral",
  Cardiovascular: "Cardiovascular",
  Metabolic: "Metabolic",
  "Nutrition & Metabolism": "Nutrition & Metabolism",
  Athletic: "Athletic",
  Immune: "Immune",
  Autoimmune: "Autoimmune",
  Inflammation: "Inflammation",
  "Cancer & Developmental": "Cancer & Developmental",
  Pain: "Pain",
  Pharmacogenomics: "Pharmacogenomics",
  "Physical Traits": "Physical Traits",
  "Bone & Musculoskeletal": "Bone & Musculoskeletal",
  "Iron & Liver": "Iron & Liver",
  "Circadian & Sleep": "Circadian & Sleep",
  "Alcohol & Metabolism": "Alcohol & Metabolism",
  "Eye & Vision": "Eye & Vision",
  "Musculoskeletal & Uric Acid": "Musculoskeletal & Uric Acid",
  "Longevity & Aging": "Longevity & Aging",
} as const;

/** Union of all valid trait category names. */
export type TraitCategory = (typeof TRAIT_CATEGORY)[keyof typeof TRAIT_CATEGORY];

/**
 * Authoritative display names for trait slugs.
 *
 * When a slug is present here its value is used verbatim as the human-readable
 * label (e.g. in `list_traits` output), overriding the auto-generated
 * title-case fallback.  Only add entries where the auto-generated name would
 * be incorrect or misleading (e.g. acronyms, medical terms, brand names).
 *
 * Slugs absent from this map fall back to `slugToDisplayName()` in
 * `snp.json-repository.ts` (splits on `_`, title-cases each word).
 */
export const TRAIT_DISPLAY_NAMES: Record<string, string> = {
  // Neurological
  alzheimer_risk: "Alzheimer's Risk",
  cognitive_decline: "Cognitive Decline",
  cognitive_function: "Cognitive Function",
  dopamine_signaling: "Dopamine Signaling",
  bipolar_disorder_risk: "Bipolar Disorder Risk",
  schizophrenia_risk: "Schizophrenia Risk",
  depression_risk: "Depression Risk",
  // Behavioral
  nicotine_dependence: "Nicotine Dependence",
  addiction_risk: "Addiction Risk",
  impulse_control: "Impulse Control",
  reward_seeking: "Reward Seeking",
  stress_response: "Stress Response",
  emotional_regulation: "Emotional Regulation",
  social_behavior: "Social Behavior",
  smoking_behavior: "Smoking Behavior",
  // Cardiovascular
  cardiovascular_disease: "Cardiovascular Disease",
  coronary_artery_disease: "Coronary Artery Disease",
  myocardial_infarction: "Myocardial Infarction",
  triglyceride_levels: "Triglyceride Levels",
  endothelial_function: "Endothelial Function",
  ldl_cholesterol: "LDL Cholesterol",
  familial_hypercholesterolemia: "Familial Hypercholesterolemia",
  thrombosis_risk: "Thrombosis Risk",
  blood_clotting: "Blood Clotting",
  hdl_cholesterol: "HDL Cholesterol",
  hypertension_risk: "Hypertension Risk",
  hdl_cholesterol_levels: "HDL Cholesterol Levels",
  // Metabolic
  folate_metabolism: "Folate Metabolism",
  homocysteine_levels: "Homocysteine Levels",
  metabolic_syndrome: "Metabolic Syndrome",
  obesity_risk: "Obesity Risk",
  type_2_diabetes: "Type 2 Diabetes",
  caffeine_metabolism: "Caffeine Metabolism",
  insulin_secretion: "Insulin Secretion",
  bmi: "BMI",
  // Nutrition & Metabolism
  lactase_persistence: "Lactase Persistence",
  lactose_intolerance: "Lactose Intolerance",
  vitamin_d_response: "Vitamin D Response",
  insulin_sensitivity: "Insulin Sensitivity",
  appetite_regulation: "Appetite Regulation",
  vitamin_d_levels: "Vitamin D Levels",
  // Immune
  immune_response: "Immune Response",
  autoimmune_risk: "Autoimmune Risk",
  immune_function: "Immune Function",
  oxidative_stress: "Oxidative Stress",
  antioxidant_defense: "Antioxidant Defense",
  // Autoimmune
  rheumatoid_arthritis_risk: "Rheumatoid Arthritis Risk",
  systemic_lupus_risk: "Systemic Lupus Risk",
  celiac_disease_risk: "Celiac Disease Risk",
  type_1_diabetes_risk: "Type 1 Diabetes Risk",
  autoimmune_thyroid_risk: "Autoimmune Thyroid Risk",
  // Inflammation
  c_reactive_protein_levels: "C-Reactive Protein Levels",
  interleukin_1_levels: "Interleukin-1 Levels",
  interleukin_10_levels: "Interleukin-10 Levels",
  // Cancer & Developmental
  lung_cancer_risk: "Lung Cancer Risk",
  neural_tube_defects: "Neural Tube Defects",
  cancer_risk: "Cancer Risk",
  melanoma_risk: "Melanoma Risk",
  chemotherapy_response: "Chemotherapy Response",
  esophageal_cancer_risk: "Esophageal Cancer Risk",
  bladder_cancer_risk: "Bladder Cancer Risk",
  benzene_toxicity: "Benzene Toxicity",
  // Pharmacogenomics
  opioid_response: "Opioid Response",
  warfarin_sensitivity: "Warfarin Sensitivity",
  drug_metabolism: "Drug Metabolism",
  nsaid_response: "NSAID Response",
  clopidogrel_response: "Clopidogrel Response",
  proton_pump_inhibitor_response: "Proton Pump Inhibitor Response",
  statin_myopathy_risk: "Statin Myopathy Risk",
  drug_transport: "Drug Transport",
  antidepressant_response: "Antidepressant Response",
  isoniazid_response: "Isoniazid Response",
  fluorouracil_toxicity: "Fluorouracil Toxicity",
  irinotecan_toxicity: "Irinotecan Toxicity",
  abacavir_hypersensitivity: "Abacavir Hypersensitivity",
  pcsk9_inhibitor_response: "PCSK9 Inhibitor Response",
  hepatitis_c_treatment: "Hepatitis C Treatment",
  beta_blocker_response: "Beta-Blocker Response",
  // Physical Traits
  red_hair: "Red Hair",
  skin_pigmentation: "Skin Pigmentation",
  eye_color: "Eye Color",
  // Bone & Musculoskeletal
  bone_density: "Bone Density",
  osteoporosis_risk: "Osteoporosis Risk",
  fracture_risk: "Fracture Risk",
  collagen_production: "Collagen Production",
  // Iron & Liver
  hemochromatosis_risk: "Hemochromatosis Risk",
  iron_overload: "Iron Overload",
  liver_disease: "Liver Disease",
  fibrosis_risk: "Fibrosis Risk",
  gilbert_syndrome: "Gilbert Syndrome",
  bilirubin_levels: "Bilirubin Levels",
  // Circadian & Sleep
  circadian_rhythm: "Circadian Rhythm",
  sleep_duration: "Sleep Duration",
  sleep_timing: "Sleep Timing",
  // Alcohol & Metabolism
  alcohol_metabolism: "Alcohol Metabolism",
  alcohol_dependence_risk: "Alcohol Dependence Risk",
  alcohol_flush_reaction: "Alcohol Flush Reaction",
  // Eye & Vision
  macular_degeneration_risk: "Macular Degeneration Risk",
  // Musculoskeletal & Uric Acid
  gout_risk: "Gout Risk",
  uric_acid_levels: "Uric Acid Levels",
  // Athletic
  athletic_performance: "Athletic Performance",
  muscle_fiber_type: "Muscle Fiber Type",
  sprint_performance: "Sprint Performance",
};

/**
 * Maps each trait slug to its display category.
 * Slugs not present here are left uncategorized (rendered under "Other" by formatting.ts).
 */
export const TRAIT_CATEGORIES: Record<string, TraitCategory> = {
  // Neurological
  alzheimer_risk: TRAIT_CATEGORY.Neurological,
  cognitive_decline: TRAIT_CATEGORY.Neurological,
  cognitive_function: TRAIT_CATEGORY.Neurological,
  memory: TRAIT_CATEGORY.Neurological,
  neuroplasticity: TRAIT_CATEGORY.Neurological,
  depression_risk: TRAIT_CATEGORY.Neurological,
  anxiety: TRAIT_CATEGORY.Neurological,
  bipolar_disorder_risk: TRAIT_CATEGORY.Neurological,
  schizophrenia_risk: TRAIT_CATEGORY.Neurological,
  dopamine_signaling: TRAIT_CATEGORY.Neurological,

  // Longevity & Aging
  longevity: TRAIT_CATEGORY["Longevity & Aging"],

  // Behavioral
  social_behavior: TRAIT_CATEGORY.Behavioral,
  empathy: TRAIT_CATEGORY.Behavioral,
  emotional_regulation: TRAIT_CATEGORY.Behavioral,
  stress_response: TRAIT_CATEGORY.Behavioral,
  addiction_risk: TRAIT_CATEGORY.Behavioral,
  reward_seeking: TRAIT_CATEGORY.Behavioral,
  impulse_control: TRAIT_CATEGORY.Behavioral,
  nicotine_dependence: TRAIT_CATEGORY.Behavioral,
  smoking_behavior: TRAIT_CATEGORY.Behavioral,

  // Cardiovascular
  cardiovascular_disease: TRAIT_CATEGORY.Cardiovascular,
  coronary_artery_disease: TRAIT_CATEGORY.Cardiovascular,
  myocardial_infarction: TRAIT_CATEGORY.Cardiovascular,
  triglyceride_levels: TRAIT_CATEGORY.Cardiovascular,
  hypertension: TRAIT_CATEGORY.Cardiovascular,
  endothelial_function: TRAIT_CATEGORY.Cardiovascular,
  ldl_cholesterol: TRAIT_CATEGORY.Cardiovascular,
  familial_hypercholesterolemia: TRAIT_CATEGORY.Cardiovascular,
  thrombosis_risk: TRAIT_CATEGORY.Cardiovascular,
  blood_clotting: TRAIT_CATEGORY.Cardiovascular,
  hdl_cholesterol: TRAIT_CATEGORY.Cardiovascular,
  hypertension_risk: TRAIT_CATEGORY.Cardiovascular,
  hdl_cholesterol_levels: TRAIT_CATEGORY.Cardiovascular,

  // Metabolic
  folate_metabolism: TRAIT_CATEGORY.Metabolic,
  homocysteine_levels: TRAIT_CATEGORY.Metabolic,
  metabolic_syndrome: TRAIT_CATEGORY.Metabolic,
  obesity_risk: TRAIT_CATEGORY.Metabolic,
  type_2_diabetes: TRAIT_CATEGORY.Metabolic,
  caffeine_metabolism: TRAIT_CATEGORY.Metabolic,
  insulin_secretion: TRAIT_CATEGORY.Metabolic,
  bmi: TRAIT_CATEGORY.Metabolic,

  // Nutrition & Metabolism
  lactase_persistence: TRAIT_CATEGORY["Nutrition & Metabolism"],
  lactose_intolerance: TRAIT_CATEGORY["Nutrition & Metabolism"],
  vitamin_d_response: TRAIT_CATEGORY["Nutrition & Metabolism"],
  insulin_sensitivity: TRAIT_CATEGORY["Nutrition & Metabolism"],
  appetite_regulation: TRAIT_CATEGORY["Nutrition & Metabolism"],
  vitamin_d_levels: TRAIT_CATEGORY["Nutrition & Metabolism"],

  // Athletic
  athletic_performance: TRAIT_CATEGORY.Athletic,
  muscle_fiber_type: TRAIT_CATEGORY.Athletic,
  sprint_performance: TRAIT_CATEGORY.Athletic,

  // Immune
  inflammation: TRAIT_CATEGORY.Immune,
  immune_response: TRAIT_CATEGORY.Immune,
  autoimmune_risk: TRAIT_CATEGORY.Immune,
  immune_function: TRAIT_CATEGORY.Immune,
  oxidative_stress: TRAIT_CATEGORY.Immune,
  antioxidant_defense: TRAIT_CATEGORY.Immune,

  // Autoimmune
  rheumatoid_arthritis_risk: TRAIT_CATEGORY.Autoimmune,
  systemic_lupus_risk: TRAIT_CATEGORY.Autoimmune,
  celiac_disease_risk: TRAIT_CATEGORY.Autoimmune,
  type_1_diabetes_risk: TRAIT_CATEGORY.Autoimmune,
  autoimmune_thyroid_risk: TRAIT_CATEGORY.Autoimmune,

  // Inflammation
  c_reactive_protein_levels: TRAIT_CATEGORY.Inflammation,
  interleukin_1_levels: TRAIT_CATEGORY.Inflammation,
  interleukin_10_levels: TRAIT_CATEGORY.Inflammation,

  // Cancer & Developmental
  lung_cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  neural_tube_defects: TRAIT_CATEGORY["Cancer & Developmental"],
  cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  melanoma_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  chemotherapy_response: TRAIT_CATEGORY["Cancer & Developmental"],
  esophageal_cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  bladder_cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  detoxification: TRAIT_CATEGORY["Cancer & Developmental"],
  benzene_toxicity: TRAIT_CATEGORY["Cancer & Developmental"],

  // Pain
  pain_sensitivity: TRAIT_CATEGORY.Pain,

  // Pharmacogenomics
  opioid_response: TRAIT_CATEGORY.Pharmacogenomics,
  warfarin_sensitivity: TRAIT_CATEGORY.Pharmacogenomics,
  drug_metabolism: TRAIT_CATEGORY.Pharmacogenomics,
  nsaid_response: TRAIT_CATEGORY.Pharmacogenomics,
  clopidogrel_response: TRAIT_CATEGORY.Pharmacogenomics,
  proton_pump_inhibitor_response: TRAIT_CATEGORY.Pharmacogenomics,
  statin_myopathy_risk: TRAIT_CATEGORY.Pharmacogenomics,
  drug_transport: TRAIT_CATEGORY.Pharmacogenomics,
  antidepressant_response: TRAIT_CATEGORY.Pharmacogenomics,
  isoniazid_response: TRAIT_CATEGORY.Pharmacogenomics,
  fluorouracil_toxicity: TRAIT_CATEGORY.Pharmacogenomics,
  irinotecan_toxicity: TRAIT_CATEGORY.Pharmacogenomics,
  abacavir_hypersensitivity: TRAIT_CATEGORY.Pharmacogenomics,
  pcsk9_inhibitor_response: TRAIT_CATEGORY.Pharmacogenomics,
  hepatitis_c_treatment: TRAIT_CATEGORY.Pharmacogenomics,
  beta_blocker_response: TRAIT_CATEGORY.Pharmacogenomics,

  // Physical Traits
  red_hair: TRAIT_CATEGORY["Physical Traits"],
  skin_pigmentation: TRAIT_CATEGORY["Physical Traits"],
  eye_color: TRAIT_CATEGORY["Physical Traits"],

  // Bone & Musculoskeletal
  bone_density: TRAIT_CATEGORY["Bone & Musculoskeletal"],
  osteoporosis_risk: TRAIT_CATEGORY["Bone & Musculoskeletal"],
  fracture_risk: TRAIT_CATEGORY["Bone & Musculoskeletal"],
  collagen_production: TRAIT_CATEGORY["Bone & Musculoskeletal"],

  // Iron & Liver
  hemochromatosis_risk: TRAIT_CATEGORY["Iron & Liver"],
  iron_overload: TRAIT_CATEGORY["Iron & Liver"],
  liver_disease: TRAIT_CATEGORY["Iron & Liver"],
  fibrosis_risk: TRAIT_CATEGORY["Iron & Liver"],
  gilbert_syndrome: TRAIT_CATEGORY["Iron & Liver"],
  bilirubin_levels: TRAIT_CATEGORY["Iron & Liver"],

  // Circadian & Sleep
  circadian_rhythm: TRAIT_CATEGORY["Circadian & Sleep"],
  sleep_duration: TRAIT_CATEGORY["Circadian & Sleep"],
  sleep_timing: TRAIT_CATEGORY["Circadian & Sleep"],

  // Alcohol & Metabolism
  alcohol_metabolism: TRAIT_CATEGORY["Alcohol & Metabolism"],
  alcohol_dependence_risk: TRAIT_CATEGORY["Alcohol & Metabolism"],
  alcohol_flush_reaction: TRAIT_CATEGORY["Alcohol & Metabolism"],

  // Eye & Vision
  macular_degeneration_risk: TRAIT_CATEGORY["Eye & Vision"],

  // Musculoskeletal & Uric Acid
  gout_risk: TRAIT_CATEGORY["Musculoskeletal & Uric Acid"],
  uric_acid_levels: TRAIT_CATEGORY["Musculoskeletal & Uric Acid"],
};
