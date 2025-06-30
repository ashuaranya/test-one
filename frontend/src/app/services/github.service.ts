import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private apiUrl = 'http://localhost:3000/api/github/';
  private authUrl = 'http://localhost:3000/api/auth/';
  constructor(private http: HttpClient) { }

  // get the integration data
  getIntegrationData() {
    return this.http.get(this.apiUrl + 'integration', { withCredentials: true });
  }

  syncAll(){
    return this.http.get(this.apiUrl + 'sync', { withCredentials: true })
  }

  disconnect() {
    return this.http.post(this.authUrl + 'remove', {}, { withCredentials: true });
  }

  getCollectionData() {
    return this.http.get(this.apiUrl + 'collections', { withCredentials: true });
  }

  getPaginatedCollectionData(collection: string, page: number, pageSize: number, search: string = '') {

    let queryString = '';
    if(page) {
      queryString += `page=${page}`;
    }
    if(pageSize) {
      queryString += `&limit=${pageSize}`;
    }
    if(search) {
      queryString += '&search=' + search;
    } 

    return this.http.get(`${this.apiUrl}${collection}?${queryString}`, { withCredentials: true });
  }
}
