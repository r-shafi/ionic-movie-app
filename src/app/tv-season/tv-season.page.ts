import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { TmdbService } from '../services/tmdb.service';

@Component({
    selector: 'app-tv-season',
    templateUrl: './tv-season.page.html',
    styleUrls: ['./tv-season.page.scss'],
    standalone: false
})
export class TvSeasonPage implements OnInit {
  tvId: number = 0;
  season: any;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private tmdb: TmdbService,
    public profileService: ProfileService,
  ) {}

  ngOnInit() {
    this.tvId = +this.route.snapshot.paramMap.get('id')!;
    const seasonNumber = +this.route.snapshot.paramMap.get('seasonNumber')!;
    this.tmdb.getTvSeason(this.tvId, seasonNumber).subscribe({
      next: (data: any) => {
        this.season = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  isEpisodeWatched(seasonNum: number, epNum: number): boolean {
    return this.profileService.isEpisodeWatched(this.tvId, seasonNum, epNum);
  }

  toggleEpisode(ep: any) {
    this.profileService.toggleEpisodeWatched(
      this.tvId,
      this.season.season_number,
      ep.episode_number,
    );
  }

  get watchedCount(): number {
    if (!this.season?.episodes) {
      return 0;
    }
    return this.season.episodes.filter((ep: any) =>
      this.isEpisodeWatched(this.season.season_number, ep.episode_number),
    ).length;
  }
}
