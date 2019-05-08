import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

import { Deposit } from '../models/deposit';

@Injectable()
export class DepositService {
  
    constructor(private http: HttpClient) { }
    url = "http://localhost:8080/api/v1/deposit/";

    getAll(query:String) {
        return this.http.get<Deposit[]>(this.url+query);
    }

    getById(id: String) {
        return this.http.get<Deposit>(this.url+ id);
    }

    create(deposit: Deposit) {
        return this.http.post(this.url, deposit)
    }

    update(deposit: Deposit) {
        return this.http.put(this.url, deposit);
    }

    delete(id: any) {
        return this.http.delete(this.url + id);
    }
}