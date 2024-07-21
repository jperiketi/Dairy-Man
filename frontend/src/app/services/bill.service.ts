import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillService {

  url = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }

  generateBill(data: any) {
    return this.httpClient.post(this.url + '/bill/generateBill/', data);
  }

  getBill(data: any): Observable<Blob> {
    return this.httpClient.post(this.url + '/bill/getBill', data, { responseType: 'blob' })
  }

  getBills() {
    return this.httpClient.get(this.url + "/bill/getBills/")
  }

  delete(id: any) {
    return this.httpClient.delete(this.url + "/bill/delete/" + id);
  }
}
