import type { GuideSource } from "./index";

// Every source here was opened and read before being cited.
export const SRC = {
  akcBlood: { title: "AKC — Blood in Dog Poop", url: "https://www.akc.org/expert-advice/health/blood-in-dog-poop/" },
  akcPoop: { title: "AKC — How to Tell If Your Dog's Poop Is Healthy", url: "https://www.akc.org/expert-advice/health/dogs-poop-says-health/" },
  akcDiarrhea: { title: "AKC — Dog Diarrhea", url: "https://www.akc.org/expert-advice/health/dog-diarrhea/" },
  akcConstipation: { title: "AKC — Dog Constipation", url: "https://www.akc.org/expert-advice/health/dog-constipation/" },
  akcWorms: { title: "AKC — Worms in Dogs", url: "https://www.akc.org/expert-advice/health/worms-in-dogs/" },
  vcaDiarrhea: { title: "VCA Animal Hospitals — Diarrhea in Dogs", url: "https://vcahospitals.com/know-your-pet/diarrhea-in-dogs" },
  vcaConstipation: { title: "VCA Animal Hospitals — Constipation in Dogs", url: "https://vcahospitals.com/know-your-pet/constipation-in-dogs" },
  vcaColitis: { title: "VCA Animal Hospitals — Colitis in Dogs", url: "https://vcahospitals.com/know-your-pet/colitis-in-dogs" },
  vcaRoundworm: { title: "VCA Animal Hospitals — Roundworm Infection in Dogs", url: "https://vcahospitals.com/know-your-pet/roundworm-infection-in-dogs" },
  vcaTapeworm: { title: "VCA Animal Hospitals — Tapeworm Infection in Dogs", url: "https://vcahospitals.com/know-your-pet/tapeworm-infection-in-dogs" },
  vcaUrgent: { title: "VCA Urgent Care — Diarrhea or Vomiting", url: "https://vcahospitals.com/urgent-care/health-concerns/diarrhea-or-vomiting" },
  merckParasites: { title: "Merck Veterinary Manual — Gastrointestinal Parasites of Dogs", url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/gastrointestinal-parasites-of-dogs" },
  tfdBlood: { title: "The Farmer's Dog — Blood in Your Dog's Stool", url: "https://www.thefarmersdog.com/digest/what-it-means-if-theres-blood-in-your-dogs-stool/" },
} satisfies Record<string, GuideSource>;

export const UPDATED = "2026-10-15";
