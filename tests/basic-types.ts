// Test file for basic TypeScript features
// Tests: interfaces, classes, enums, inheritance, simple properties

interface Animal {
  id: string;
  name: string;
  species: string;
  age?: number;
  readonly dateOfBirth: Date;
}

interface Pet extends Animal {
  owner: string;
  vaccinated: boolean;
  tags: string[];
}

interface WildAnimal extends Animal {
  habitat: string;
  endangered: boolean;
  population?: number;
}

enum AnimalType {
  Mammal = "MAMMAL",
  Bird = "BIRD",
  Reptile = "REPTILE",
  Fish = "FISH",
  Amphibian = "AMPHIBIAN"
}

class AnimalShelter {
  private animals: Animal[];
  private capacity: number;

  constructor(capacity: number) {
    this.animals = [];
    this.capacity = capacity;
  }

  addAnimal(animal: Animal): boolean {
    if (this.animals.length < this.capacity) {
      this.animals.push(animal);
      return true;
    }
    return false;
  }

  findBySpecies(species: string): Animal[] {
    return this.animals.filter(a => a.species === species);
  }

  getCount(): number {
    return this.animals.length;
  }
}

class PetClinic implements ClinicService {
  private patients: Pet[];
  private vetName: string;

  constructor(vetName: string) {
    this.patients = [];
    this.vetName = vetName;
  }

  treatAnimal(pet: Pet): void {
    if (this.vetName) {
      console.log(`Treating ${pet.name} at the clinic.`);
      this.patients.push(pet);
    }
  }

  getPatientCount(): number {
    return this.patients.length;
  }
}

interface ClinicService {
  treatAnimal(pet: Pet): void;
  getPatientCount(): number;
}
