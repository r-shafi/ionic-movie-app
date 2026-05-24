import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  creditRole: 'all' | 'acting' | 'crew' = 'all';
  creditSort: 'newest' | 'oldest' | 'popular' = 'newest';

  constructor(
    private route: ActivatedRoute,
    private tmdb: TmdbService,
    private cdr: ChangeDetectorRef,
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
        const dept = (this.person?.known_for_department || '').toLowerCase();
        this.creditRole = dept && dept !== 'acting' ? 'crew' : 'acting';
        this.isLoading = false;
        this.cdr.detectChanges();
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
    return this.buildCredits('movie');
  }

  get tvCredits(): any[] {
    return this.buildCredits('tv');
  }

  get bioShort(): string {
    const bio = this.person?.biography || '';
    return bio.length > 300 ? bio.substring(0, 300) + '...' : bio;
  }

  get ageValue(): string | null {
    const birthday = this.person?.birthday;
    if (!birthday) {
      return null;
    }
    const start = new Date(birthday);
    if (Number.isNaN(start.getTime())) {
      return null;
    }
    const end = this.person?.deathday
      ? new Date(this.person.deathday)
      : new Date();
    let age = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
      age -= 1;
    }
    return `${age}`;
  }

  get popularityLabel(): string | null {
    const p = this.person?.popularity;
    return p ? p.toFixed(1) : null;
  }

  get movieCount(): number {
    return this.movieCredits.length;
  }

  get tvCount(): number {
    return this.tvCredits.length;
  }

  get photoCount(): number {
    return this.images.length;
  }

  get totalCredits(): number {
    const castCount = this.credits?.cast?.length || 0;
    const crewCount = this.credits?.crew?.length || 0;
    return castCount + crewCount;
  }

  get socialLinks(): { label: string; url: string; icon: string }[] {
    const links: { label: string; url: string; icon: string }[] = [];
    const ids = this.person?.external_ids || {};
    if (this.person?.homepage) {
      links.push({
        label: 'Website',
        url: this.person.homepage,
        icon: 'globe-outline',
      });
    }
    const imdbId = this.person?.imdb_id || ids.imdb_id;
    if (imdbId) {
      links.push({
        label: 'IMDb',
        url: `https://www.imdb.com/name/${imdbId}`,
        icon: 'film-outline',
      });
    }
    if (ids.instagram_id) {
      links.push({
        label: 'Instagram',
        url: `https://www.instagram.com/${ids.instagram_id}`,
        icon: 'logo-instagram',
      });
    }
    if (ids.twitter_id) {
      links.push({
        label: 'Twitter',
        url: `https://twitter.com/${ids.twitter_id}`,
        icon: 'logo-twitter',
      });
    }
    if (ids.facebook_id) {
      links.push({
        label: 'Facebook',
        url: `https://www.facebook.com/${ids.facebook_id}`,
        icon: 'logo-facebook',
      });
    }
    if (ids.youtube_id) {
      links.push({
        label: 'YouTube',
        url: `https://www.youtube.com/${ids.youtube_id}`,
        icon: 'logo-youtube',
      });
    }
    if (ids.tiktok_id) {
      links.push({
        label: 'TikTok',
        url: `https://www.tiktok.com/@${ids.tiktok_id}`,
        icon: 'logo-tiktok',
      });
    }
    if (ids.wikidata_id) {
      links.push({
        label: 'Wikidata',
        url: `https://www.wikidata.org/wiki/${ids.wikidata_id}`,
        icon: 'information-circle-outline',
      });
    }
    return links;
  }

  private buildCredits(mediaType: 'movie' | 'tv'): any[] {
    const source = this.getCreditsByRole();
    let items = source.filter((c: any) => {
      const mt = c.media_type || (c.first_air_date ? 'tv' : 'movie');
      return mt === mediaType;
    });

    const seen = new Set<number>();
    items = items.filter((c: any) => {
      if (seen.has(c.id)) {
        return false;
      }
      seen.add(c.id);
      return true;
    });

    items = items.map((c: any) => ({
      ...c,
      media_type: c.media_type || mediaType,
    }));

    const byDate = (c: any) =>
      new Date(c.release_date || c.first_air_date || 0).getTime();

    if (this.creditSort === 'popular') {
      items.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
    } else if (this.creditSort === 'oldest') {
      items.sort((a: any, b: any) => byDate(a) - byDate(b));
    } else {
      items.sort((a: any, b: any) => byDate(b) - byDate(a));
    }

    return items.slice(0, 30);
  }

  private getCreditsByRole(): any[] {
    const cast = this.credits?.cast || [];
    const crew = this.credits?.crew || [];
    if (this.creditRole === 'acting') {
      return cast;
    }
    if (this.creditRole === 'crew') {
      return crew;
    }
    return [...cast, ...crew];
  }
}
