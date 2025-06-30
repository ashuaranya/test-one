import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubService } from '../services/github.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GithubCollectionsComponent } from "../github-collections/github-collections.component";

@Component({
  selector: 'app-github-connect',
  standalone: true,
  providers: [GithubService],
  imports: [MatCardModule, MatTooltipModule, MatProgressSpinnerModule, MatButtonModule, MatExpansionModule, MatIconModule, HttpClientModule, CommonModule, GithubCollectionsComponent],
  templateUrl: './github-connect.component.html',
  styleUrls: ['./github-connect.component.scss']
})
export class GithubConnectComponent implements OnInit {
  isConnected = false;
  admin = 'Admin';
  lastSynced = '';
  syncType = '';
  createdAt: any;
  syncInProgress = false;
  syncCompleted: boolean = false;
  constructor(private route: ActivatedRoute, private router: Router, private githubService: GithubService) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      if(params.get('auth') === 'success') {
        this.isConnected = true;
        this.githubService.getIntegrationData().subscribe((data: any) => {
          this.admin = data.profile.username;
          this.createdAt = data.connectedAt;
          this.lastSynced = data.lastSynced;
          this.syncType = data.syncType;

          const user = {
          username: this.admin,
          connectedAt: this.createdAt,
          lastSynced: this.lastSynced,
          syncType: this.syncType
          };
          sessionStorage.setItem('githubUser', JSON.stringify(user));
          this.syncCompleted = true;
        });
        // this.syncInProgress = true;
        // this.sync();
      } else {
        this.isConnected = false;
        this.router.navigate(['/github-connect']);
      }
    } , error => {
      // rediect to /github-connect with routes
      console.error('Error fetching query parameters', error);
      this.isConnected = false;
      this.router.navigate(['/github-connect']);
    });
  }

  sync() {
    this.syncInProgress = true;
    this.githubService.syncAll().subscribe((data: any) => {
      let response = data.data;
      this.syncCompleted = true;
      this.syncInProgress = false;
      this.lastSynced = response.lastSynced;
      this.syncType = response.syncType;
      const user = JSON.parse(sessionStorage.getItem('githubUser') || '{}');
      user.lastSynced = this.lastSynced;
      user.syncType = this.syncType;
      sessionStorage.setItem('githubUser', JSON.stringify(user));
    } , error => {
      this.syncInProgress = false;
      console.error('Sync failed', error);
      this.lastSynced = 'Sync failed';
      this.syncType = 'full';
      this.router.navigate(['/github-connect']);
    });
  }

  connect() {
    window.location.href = 'http://localhost:3000/api/auth/github';
  }

  disconnet() {
    this.githubService.disconnect().subscribe(() => {
      sessionStorage.removeItem('githubUser');
      this.isConnected = false;
      this.admin = 'Admin';
      this.lastSynced = '2023-10-07 15:11 PM';
      this.syncType = 'full';
      this.createdAt = null;
      this.syncCompleted = false;
    }, error => {
      console.error('Disconnection failed', error);
    });
  }
} 