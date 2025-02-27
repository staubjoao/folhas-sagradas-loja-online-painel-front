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

@Injectable()
export class CategoryService {

  private apiUrlBase = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCategories() {
    const url = this.apiUrlBase + '/api/category';
    console.log('URL: ' + url);
    return this.http.get<Category[]>(url);
  }

}