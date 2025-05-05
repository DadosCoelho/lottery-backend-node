class Bet {
    constructor(userId, modality, initialContest, finalContest, numbers, clovers = []) {
      this.userId = userId;
      this.modality = modality;
      this.initialContest = initialContest;
      this.finalContest = finalContest;
      this.numbers = numbers;
      this.clovers = clovers;
    }
  
    toJSON() {
      return {
        user_id: this.userId,
        modality: this.modality,
        initial_contest: this.initialContest,
        final_contest: this.finalContest,
        numbers: this.numbers,
        clovers: this.clovers
      };
    }
  
    static validate(modality, numbers, clovers) {
      if (modality === 'Mega-Sena') {
        return numbers.length === 6 && numbers.every(n => n >= 1 && n <= 60) && clovers.length === 0;
      }
      if (modality === '+Milionária') {
        return (
          numbers.length === 6 &&
          numbers.every(n => n >= 1 && n <= 50) &&
          clovers.length === 2 &&
          clovers.every(c => c >= 1 && c <= 6)
        );
      }
      if (modality === 'Lotofácil') {
        return numbers.length === 15 && numbers.every(n => n >= 1 && n <= 25) && clovers.length === 0;
      }
      if (modality === 'Quina') {
        return numbers.length === 5 && numbers.every(n => n >= 1 && n <= 80) && clovers.length === 0;
      }
      if (modality === 'Dia de Sorte') {
        return numbers.length === 7 && numbers.every(n => n >= 1 && n <= 31) && clovers.length === 0;
      }
      return false;
    }
  }
  
  module.exports = Bet;