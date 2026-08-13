/**
 * Item Model structure representation
 */
class Item {
  constructor(id, name, expiryDate, category = 'General') {
    this.id = id;
    this.name = name;
    this.expiryDate = expiryDate;
    this.category = category;
    this.createdAt = new Date();
  }
}

module.exports = Item;
