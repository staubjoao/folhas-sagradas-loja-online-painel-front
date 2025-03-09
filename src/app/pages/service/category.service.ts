import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/env';

export interface Category {
  id?: number;
  createdBy?: string;
  createdDate?: Date;
  updatedBy?: string;
  updatedDate?: Date;
  status?: boolean;
  name?: string;
  description?: string;
}

export interface CategorySaveDTO {
  name?: string;
  description?: string;
}

@Injectable()
export class CategoryService {

  private apiUrlBase = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCategories() {
    const url = this.apiUrlBase + '/api/category';
    return this.http.get<Category[]>(url);
  }

  saveNewCategory(category: CategorySaveDTO) {
    const url = this.apiUrlBase + '/api/category';
    return this.http.post<Category>(url, category);
  }

  updateCategory(category: Category) {
    const url = this.apiUrlBase + '/api/category';
    return this.http.put<Category>(url, category);
  }

  deleteCategory(id: number) {
    const url = this.apiUrlBase + '/api/category/' + id;
    return this.http.delete(url);
  }

}