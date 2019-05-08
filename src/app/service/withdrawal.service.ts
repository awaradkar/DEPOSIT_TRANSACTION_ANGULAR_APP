import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

import { Withdrawal } from '../models/withdrawal';

@Injectable()
export class WithdrawalService {
  
    constructor(private http: HttpClient) { }
    url = "http://localhost:8080/api/v1/withdraw/";

    getAll(query:String) {
        return this.http.get<Withdrawal[]>(this.url+query);
    }

    getById(id: String) {
        return this.http.get<Withdrawal>(this.url+ id);
    }

    create(withdraw: Withdrawal) {
        return this.http.post(this.url, withdraw)
    }

    update(withdraw: Withdrawal) {
        return this.http.put(this.url, withdraw);
    }

    delete(id: any) {
        return this.http.delete(this.url + id);
    }
}