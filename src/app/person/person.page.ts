import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TmdbService } from '../services/tmdb.service';

@Component({
    selector: 'app-person',
    templateUrl: './person.page.html',
    styleUrls: ['./person.page.scss'],
    standalone: false
})
export class PersonPage implements OnInit {
  person: any;
  credits: any;
  images: any[] = [];
  isLoading = true;
  showFullBio = false;
  activeTab: 'movies' | 'tv' | 'photos' = 'movies';

  constructor(
    private route: ActivatedRoute,
    private tmdb: TmdbService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      person: this.tmdb.getPersonDetails(id),
      credits: this.tmdb.getPersonCredits(id),
      images: this.tmdb.getPersonImages(id),
    }).subscribe({
      next: (data: any) => {
        this.person = data.person;
        this.credits = data.credits;
        this.images = (data.images?.profiles || []).slice(0, 20);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  get profileUrl(): string {
    return this.person?.profile_path
      ? `https://image.tmdb.org/t/p/w342${this.person.profile_path}`
      : 'assets/no-image.png';
  }

  get movieCredits(): any[] {
    return (this.credits?.cast || [])
      .filter(
        (c: any) =>
          c.media_type === 'movie' ||
          !c.first_air_date === false ||
          c.release_date,
      )
      .sort((a: any, b: any) => {
        const da = new Date(a.release_date || 0).getTime();
        const db = new Date(b.release_date || 0).getTime();
        return db - da;
      })
      .map((c: any) => ({ ...c, media_type: 'movie' }))
      .slice(0, 30);
  }

  get tvCredits(): any[] {
    return (this.credits?.cast || [])
      .filter((c: any) => c.first_air_date)
      .sort((a: any, b: any) => {
        const da = new Date(a.first_air_date || 0).getTime();
        const db = new Date(b.first_air_date || 0).getTime();
        return db - da;
      })
      .map((c: any) => ({ ...c, media_type: 'tv' }))
      .slice(0, 30);
  }

  get bioShort(): string {
    const bio = this.person?.biography || '';
    return bio.length > 300 ? bio.substring(0, 300) + '...' : bio;
  }
}
