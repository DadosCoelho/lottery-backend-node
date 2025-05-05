class User {
    constructor(uid, email, name, role = 'common', isPremium = false) {
      this.uid = uid;
      this.email = email;
      this.name = name;
      this.role = role;
      this.isPremium = isPremium;
    }
  
    toJSON() {
      return {
        email: this.email,
        name: this.name,
        role: this.role,
        is_premium: this.isPremium
      };
    }
  }
  
  module.exports = User;