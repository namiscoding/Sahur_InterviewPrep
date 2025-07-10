import { CategoryForCustomer } from "./category.types";
import { Tag } from "./tag.types";

export interface Question {
  id: number;
  content: string;
  difficultyLevel: string;
  categories: CategoryForCustomer[];
  tags: Tag[];
}