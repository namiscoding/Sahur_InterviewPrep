import { CategoryForCustomer } from "./category.types";
import { Tag } from "./tag.types";

export interface Question {
  id: number;
  content: string;
  difficultyLevel: string;
  categories: CategoryForCustomer[];
  tags: Tag[];
}

export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}