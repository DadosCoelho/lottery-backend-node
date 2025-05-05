class GroupBet {
    constructor(creatorId, modality, initialContest, finalContest, numbers, clovers = [], participants = null) {
      this.creatorId = creatorId;
      this.modality = modality;
      this.initialContest = initialContest;
      this.finalContest = finalContest;
      this.numbers = numbers;
      this.clovers = clovers;
      this.participants = participants || { [creatorId]: true };
    }
  
    toJSON() {
      return {
        creator_id: this.creatorId,
        modality: this.modality,
        initial_contest: this.initialContest,
        final_contest: this.finalContest,
        numbers: this.numbers,
        clovers: this.clovers,
        participants: this.participants
      };
    }
  }
  
  module.exports = GroupBet;