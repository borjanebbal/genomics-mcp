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
} as const;

/** Union of all valid trait category names. */
export type TraitCategory = (typeof TRAIT_CATEGORY)[keyof typeof TRAIT_CATEGORY];

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
  longevity: TRAIT_CATEGORY.Neurological,
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
  // Metabolic
  folate_metabolism: TRAIT_CATEGORY.Metabolic,
  homocysteine_levels: TRAIT_CATEGORY.Metabolic,
  metabolic_syndrome: TRAIT_CATEGORY.Metabolic,
  obesity_risk: TRAIT_CATEGORY.Metabolic,
  type_2_diabetes: TRAIT_CATEGORY.Metabolic,
  caffeine_metabolism: TRAIT_CATEGORY.Metabolic,
  insulin_secretion: TRAIT_CATEGORY.Metabolic,
  // Nutrition & Metabolism
  lactase_persistence: TRAIT_CATEGORY["Nutrition & Metabolism"],
  lactose_intolerance: TRAIT_CATEGORY["Nutrition & Metabolism"],
  vitamin_d_response: TRAIT_CATEGORY["Nutrition & Metabolism"],
  insulin_sensitivity: TRAIT_CATEGORY["Nutrition & Metabolism"],
  appetite_regulation: TRAIT_CATEGORY["Nutrition & Metabolism"],
  // Athletic
  athletic_performance: TRAIT_CATEGORY.Athletic,
  muscle_fiber_type: TRAIT_CATEGORY.Athletic,
  sprint_performance: TRAIT_CATEGORY.Athletic,
  // Immune
  inflammation: TRAIT_CATEGORY.Immune,
  immune_response: TRAIT_CATEGORY.Immune,
  autoimmune_risk: TRAIT_CATEGORY.Immune,
  immune_function: TRAIT_CATEGORY.Immune,
  // Autoimmune
  rheumatoid_arthritis_risk: TRAIT_CATEGORY.Autoimmune,
  systemic_lupus_risk: TRAIT_CATEGORY.Autoimmune,
  celiac_disease_risk: TRAIT_CATEGORY.Autoimmune,
  type_1_diabetes_risk: TRAIT_CATEGORY.Autoimmune,
  // Inflammation
  c_reactive_protein_levels: TRAIT_CATEGORY.Inflammation,
  // Cancer & Developmental
  lung_cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  neural_tube_defects: TRAIT_CATEGORY["Cancer & Developmental"],
  cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  melanoma_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  chemotherapy_response: TRAIT_CATEGORY["Cancer & Developmental"],
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
  // Physical Traits
  red_hair: TRAIT_CATEGORY["Physical Traits"],
  skin_pigmentation: TRAIT_CATEGORY["Physical Traits"],
  eye_color: TRAIT_CATEGORY["Physical Traits"],
  // Bone & Musculoskeletal
  bone_density: TRAIT_CATEGORY["Bone & Musculoskeletal"],
  osteoporosis_risk: TRAIT_CATEGORY["Bone & Musculoskeletal"],
  // Iron & Liver
  hemochromatosis_risk: TRAIT_CATEGORY["Iron & Liver"],
  iron_overload: TRAIT_CATEGORY["Iron & Liver"],
  liver_disease: TRAIT_CATEGORY["Iron & Liver"],
  fibrosis_risk: TRAIT_CATEGORY["Iron & Liver"],
  // Circadian & Sleep
  circadian_rhythm: TRAIT_CATEGORY["Circadian & Sleep"],
  sleep_duration: TRAIT_CATEGORY["Circadian & Sleep"],
  // Alcohol & Metabolism
  alcohol_metabolism: TRAIT_CATEGORY["Alcohol & Metabolism"],
  alcohol_dependence_risk: TRAIT_CATEGORY["Alcohol & Metabolism"],
  alcohol_flush_reaction: TRAIT_CATEGORY["Alcohol & Metabolism"],
  // Cardiovascular (extended)
  hdl_cholesterol: TRAIT_CATEGORY.Cardiovascular,
  // Cancer & Developmental (extended)
  esophageal_cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  bladder_cancer_risk: TRAIT_CATEGORY["Cancer & Developmental"],
  // Immune (extended)
  oxidative_stress: TRAIT_CATEGORY.Immune,
  // Eye & Vision
  macular_degeneration_risk: TRAIT_CATEGORY["Eye & Vision"],
  // Musculoskeletal & Uric Acid
  gout_risk: TRAIT_CATEGORY["Musculoskeletal & Uric Acid"],
  uric_acid_levels: TRAIT_CATEGORY["Musculoskeletal & Uric Acid"],
  // Pharmacogenomics (extended)
  fluorouracil_toxicity: TRAIT_CATEGORY.Pharmacogenomics,
  irinotecan_toxicity: TRAIT_CATEGORY.Pharmacogenomics,
  abacavir_hypersensitivity: TRAIT_CATEGORY.Pharmacogenomics,
  pcsk9_inhibitor_response: TRAIT_CATEGORY.Pharmacogenomics,
  // Cardiovascular (extended)
  hypertension_risk: TRAIT_CATEGORY.Cardiovascular,
  hdl_cholesterol_levels: TRAIT_CATEGORY.Cardiovascular,
  // Neurological (extended)
  bipolar_disorder_risk: TRAIT_CATEGORY.Neurological,
  schizophrenia_risk: TRAIT_CATEGORY.Neurological,
  // Iron & Liver (extended)
  gilbert_syndrome: TRAIT_CATEGORY["Iron & Liver"],
  bilirubin_levels: TRAIT_CATEGORY["Iron & Liver"],
  // Circadian & Sleep (extended)
  sleep_timing: TRAIT_CATEGORY["Circadian & Sleep"],
  // Nutrition & Metabolism (extended)
  vitamin_d_levels: TRAIT_CATEGORY["Nutrition & Metabolism"],
  // Pharmacogenomics (extended 2)
  hepatitis_c_treatment: TRAIT_CATEGORY.Pharmacogenomics,
  beta_blocker_response: TRAIT_CATEGORY.Pharmacogenomics,
  // Inflammation (extended)
  interleukin_1_levels: TRAIT_CATEGORY.Inflammation,
  interleukin_10_levels: TRAIT_CATEGORY.Inflammation,
  // Neurological (extended 2)
  dopamine_signaling: TRAIT_CATEGORY.Neurological,
  // Bone & Musculoskeletal (extended)
  fracture_risk: TRAIT_CATEGORY["Bone & Musculoskeletal"],
  collagen_production: TRAIT_CATEGORY["Bone & Musculoskeletal"],
  // Cancer & Developmental (extended 2)
  detoxification: TRAIT_CATEGORY["Cancer & Developmental"],
  benzene_toxicity: TRAIT_CATEGORY["Cancer & Developmental"],
  // Immune (extended 2)
  antioxidant_defense: TRAIT_CATEGORY.Immune,
  // Metabolic (extended)
  bmi: TRAIT_CATEGORY.Metabolic,
  // Autoimmune (extended)
  autoimmune_thyroid_risk: TRAIT_CATEGORY.Autoimmune,
  graves_disease_risk: TRAIT_CATEGORY.Autoimmune,
};
