export const EDUCATION = ["High School", "Bachelor's", "Master's", "PhD"];
export const EMPLOYMENT = ["Full-time", "Part-time", "Self-employed", "Unemployed"];
export const MARITAL = ["Single", "Married", "Divorced"];
export const YES_NO = ["Yes", "No"];
export const PURPOSE = ["Home", "Auto", "Education", "Business", "Other"];
export const TERMS = [12, 24, 36, 48, 60];
export const emptyForm = { age: 34, income: 72000, loanAmount: 48000, creditScore: 680, monthsEmployed: 36, numCreditLines: 3, interestRate: 11.5, loanTerm: 36, dtiRatio: 0.32, education: "Bachelor's", employmentType: "Full-time", maritalStatus: "Married", hasMortgage: "No", hasDependents: "Yes", loanPurpose: "Home", hasCoSigner: "No" };
export const sampleProfiles = [{ name: "Prime applicant", form: { ...emptyForm, age: 56, income: 85994, loanAmount: 50587, creditScore: 720, monthsEmployed: 80, interestRate: 8.15, dtiRatio: 0.28, hasMortgage: "Yes", hasCoSigner: "Yes" } }, { name: "Stress case", form: { ...emptyForm, age: 25, income: 40298, loanAmount: 90448, creditScore: 451, monthsEmployed: 8, interestRate: 22.72, dtiRatio: 0.68, education: "High School", employmentType: "Unemployed", maritalStatus: "Single", loanPurpose: "Auto", hasCoSigner: "No" } }];
export const DATASET_STATS = [{ label: "Historical applications", value: "255,347" }, { label: "Model accuracy", value: "88.6%" }, { label: "Observed default rate", value: "11.6%" }, { label: "Model features", value: "16" }];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => Number((Math.random() * (max - min) + min).toFixed(decimals));

export function getRandomLowRiskForm() {
  return {
    age: randomInt(30, 65),
    income: randomInt(80, 160) * 1000,
    loanAmount: randomInt(10, 40) * 1000,
    creditScore: randomInt(720, 840),
    monthsEmployed: randomInt(48, 180),
    numCreditLines: randomInt(1, 4),
    interestRate: randomFloat(4.5, 9.5),
    loanTerm: pickRandom([12, 24, 36, 48, 60]),
    dtiRatio: randomFloat(0.12, 0.30),
    education: pickRandom(["Bachelor's", "Master's", "PhD"]),
    employmentType: pickRandom(["Full-time", "Full-time", "Self-employed"]),
    maritalStatus: pickRandom(["Married", "Single"]),
    hasMortgage: pickRandom(["Yes", "No"]),
    hasDependents: pickRandom(["Yes", "No"]),
    loanPurpose: pickRandom(PURPOSE),
    hasCoSigner: pickRandom(["Yes", "No"]),
  };
}

export function getRandomHighRiskForm() {
  return {
    age: randomInt(20, 32),
    income: randomInt(18, 38) * 1000,
    loanAmount: randomInt(75, 140) * 1000,
    creditScore: randomInt(350, 560),
    monthsEmployed: randomInt(1, 12),
    numCreditLines: randomInt(6, 12),
    interestRate: randomFloat(18.5, 27.5),
    loanTerm: pickRandom([36, 48, 60]),
    dtiRatio: randomFloat(0.58, 0.88),
    education: pickRandom(["High School", "Bachelor's"]),
    employmentType: pickRandom(["Unemployed", "Part-time", "Self-employed"]),
    maritalStatus: pickRandom(["Single", "Divorced"]),
    hasMortgage: "No",
    hasDependents: pickRandom(["Yes", "No"]),
    loanPurpose: pickRandom(["Auto", "Business", "Other", "Education"]),
    hasCoSigner: "No",
  };
}

