import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Observable, from, map, switchMap, timeout } from 'rxjs';
import packageJson from '../../../package.json';

export interface UpdateInfo {
  latestVersion: string;
  currentVersion: string;
  releaseUrl: string;
  releaseNotes: string;
}

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private readonly owner = 'r-shafi';
  private readonly repo = 'open-movie-tracker';

  constructor(private http: HttpClient) {}

  checkForUpdate(): Observable<UpdateInfo | null> {
    const headers = new HttpHeaders({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    });

    return from(this.getCurrentVersion()).pipe(
      switchMap((currentVersion) =>
        this.http
          .get<any>(
            `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`,
            { headers },
          )
          .pipe(
            timeout(15000),
            map((release) => {
              const latestVersion = this.normalizeVersion(
                release?.tag_name || '',
              );
              const current = this.normalizeVersion(currentVersion);
              if (
                !latestVersion ||
                this.compareVersions(latestVersion, current) <= 0
              ) {
                return null;
              }
              return {
                latestVersion,
                currentVersion: current,
                releaseUrl:
                  release?.html_url ||
                  `https://github.com/${this.owner}/${this.repo}/releases`,
                releaseNotes: release?.body || '',
              } as UpdateInfo;
            }),
          ),
      ),
    );
  }

  private async getCurrentVersion(): Promise<string> {
    try {
      const info = await App.getInfo();
      return info.version || packageJson.version;
    } catch {
      return packageJson.version;
    }
  }

  private normalizeVersion(version: string): string {
    return (version || '').trim().replace(/^v/i, '');
  }

  private compareVersions(a: string, b: string): number {
    const parse = (value: string): number[] => {
      const core = value.split('-')[0];
      return core.split('.').map((part) => Number.parseInt(part, 10) || 0);
    };

    const pa = parse(a);
    const pb = parse(b);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i += 1) {
      const va = pa[i] || 0;
      const vb = pb[i] || 0;
      if (va > vb) {
        return 1;
      }
      if (va < vb) {
        return -1;
      }
    }
    return 0;
  }
}
