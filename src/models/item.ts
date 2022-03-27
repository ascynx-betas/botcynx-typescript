import * as mongoose from "mongoose";

export interface item {
  displayName: string;
  name: string;
  lore: string;
  enchantments: {
    [key: string]: {
      name: string;
      level: number;
    };
  };
  currentPrice: number;
  currency: string;
  type: "currency" | "item" | "material";
}

const schema = new mongoose.Schema<item>({
  displayName: String,
  name: String,
  lore: String,
  enchantments: {},
  currentPrice: Number,
  currency: String,
  type: String,
});

const itemModel = mongoose.model<item>("monumentaItem", schema);

export { itemModel };
