/**
 * Pure utility function to calculate estimated daily nutrition needs.
 * No side effects.
 *
 * @param {Object} params
 * @param {number} params.age - Age in years (10-100)
 * @param {string} params.gender - 'male' | 'female'
 * @param {number} params.weightKg - Weight in kilograms (20-300)
 * @param {number} params.heightCm - Height in centimeters (100-250)
 * @param {string} params.activityLevel - 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
 *
 * @returns {Object} { isValid: boolean, errors: Object, result: Object|null }
 */
export function calculateNutritionNeeds({ age, gender, weightKg, heightCm, activityLevel }) {
  const errors = {};

  const numAge = Number(age);
  const numWeight = Number(weightKg);
  const numHeight = Number(heightCm);

  if (isNaN(numAge) || numAge < 10 || numAge > 100) {
    errors.age = 'Age must be between 10 and 100 years.';
  }

  if (!['male', 'female'].includes(gender)) {
    errors.gender = 'Please select a valid gender (male or female).';
  }

  if (isNaN(numWeight) || numWeight < 20 || numWeight > 300) {
    errors.weightKg = 'Weight must be between 20 and 300 kg.';
  }

  if (isNaN(numHeight) || numHeight < 100 || numHeight > 250) {
    errors.heightCm = 'Height must be between 100 and 250 cm.';
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const activityWaterBonuses = {
    sedentary: 0,
    light: 350,
    moderate: 700,
    active: 1050,
    very_active: 1400,
  };

  if (!activityMultipliers[activityLevel]) {
    errors.activityLevel = 'Please select a valid activity level.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors,
      result: null,
    };
  }

  // BMR — Mifflin-St Jeor Formula
  let bmrRaw = 10 * numWeight + 6.25 * numHeight - 5 * numAge;
  if (gender === 'male') {
    bmrRaw += 5;
  } else {
    bmrRaw -= 161;
  }

  const multiplier = activityMultipliers[activityLevel];
  const caloriesRaw = bmrRaw * multiplier;
  const proteinGRaw = 1.2 * numWeight;
  const fatGRaw = (caloriesRaw * 0.27) / 9;
  const carbsGRaw = Math.max(0, (caloriesRaw - proteinGRaw * 4 - fatGRaw * 9) / 4);
  const fibreGRaw = (caloriesRaw / 1000) * 14;
  const waterMlRaw = 35 * numWeight + activityWaterBonuses[activityLevel];

  return {
    isValid: true,
    errors: {},
    result: {
      bmr: Math.round(bmrRaw),
      calories: Math.round(caloriesRaw),
      proteinG: Math.round(proteinGRaw),
      fatG: Math.round(fatGRaw),
      carbsG: Math.round(carbsGRaw),
      fibreG: Math.round(fibreGRaw),
      waterMl: Math.round(waterMlRaw),
    },
  };
}
