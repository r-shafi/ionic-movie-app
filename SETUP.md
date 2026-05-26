# Release Process — Open Movie Tracker

This document describes the automated release pipeline for contributors and maintainers.

---

## How to Write Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/). A local `commitlint` hook enforces the format on every commit.

**Format:** `<type>(<optional scope>): <description>`

| Type                                | Effect                     | Example                                 |
| ----------------------------------- | -------------------------- | --------------------------------------- |
| `fix`                               | Patch bump (1.0.0 → 1.0.1) | `fix: correct crash on empty watchlist` |
| `feat`                              | Minor bump (1.0.0 → 1.1.0) | `feat: add sorting to the diary page`   |
| `feat!` or `BREAKING CHANGE:`       | Major bump (1.0.0 → 2.0.0) | `feat!: redesign local storage schema`  |
| `chore`, `refactor`, `perf`, `docs` | No release bump            | `chore: update dependencies`            |

> **Squash-merge PRs** use the PR title as the commit message — make the PR title a valid conventional commit.

---

## What Happens Automatically

```
git push to main
      │
      ▼
[CI workflow] — lint + build + versionCode check (~3 min)
      │
      ▼
[Release Please] — opens/updates a "Release PR" accumulating commits
      │  (no release yet — just a PR showing the pending changelog)
      ▼
merge the Release PR
      │
      ▼
[Release Please] — bumps version in package.json and build.gradle,
                   updates CHANGELOG.md, creates a GitHub Release + git tag (vX.Y.Z)
      │
      ▼
[Build & Release APK workflow] — triggered by the new vX.Y.Z tag
      │
      ▼
  Increments versionCode, builds signed APK via Gradle,
  attaches APK to the GitHub Release, commits F-Droid changelog
```

No manual steps are required after a `git push`.

---

## How to Trigger a Release

1. Make one or more commits following the conventional commit format and push to `main`.
2. A **"Release vX.Y.Z"** pull request is automatically opened (or updated) by release-please.
3. Review the auto-generated changelog in the PR, then **merge it**.
4. The signed APK is built and attached to the GitHub Release within ~10 minutes.

---

## Where to Find Signed APKs

Every release is published at:

```
https://github.com/r-shafi/open-movie-tracker/releases
```

Each release has a `open-movie-tracker-vX.Y.Z.apk` asset that is ready to install.

---

## Required GitHub Secrets

Configure these in **GitHub → Settings → Secrets and Variables → Actions**:

| Secret              | Description                              | How to generate                                    |
| ------------------- | ---------------------------------------- | -------------------------------------------------- |
| `KEYSTORE_BASE64`   | Base-64 encoded release keystore         | `base64 -w 0 release.keystore`                     |
| `KEY_ALIAS`         | Alias used when the keystore was created | From `keytool -list -v -keystore release.keystore` |
| `KEYSTORE_PASSWORD` | Keystore store password                  | Chosen during `keytool -genkey`                    |
| `KEY_PASSWORD`      | Key entry password                       | Chosen during `keytool -genkey`                    |

`GITHUB_TOKEN` is provided automatically by GitHub Actions — no setup needed.

---

## Generating a Keystore (First-Time Setup)

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias open-movie-tracker \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

Then encode it for GitHub Secrets:

```bash
base64 -w 0 release.keystore
```

Paste the output as the value of the `KEYSTORE_BASE64` secret. **Never commit `release.keystore` to git.**

---

## Rotating the Keystore

> **Warning:** Changing the signing key breaks updates for users who installed a previous APK (Android rejects APKs signed with a different key). Only rotate if the keystore is lost or compromised.

1. Generate a new keystore with `keytool` (see above).
2. Update the four GitHub Secrets (`KEYSTORE_BASE64`, `KEY_ALIAS`, `KEYSTORE_PASSWORD`, `KEY_PASSWORD`).
3. The next release will use the new key. Inform users they may need to uninstall and reinstall the app.

---

## F-Droid Changelogs

After each release, the workflow automatically generates a per-version changelog at:

```
fastlane/metadata/android/en-US/changelogs/<versionCode>.txt
```

This is read by F-Droid to display "What's new" in the store listing. The content is extracted from the latest section of `CHANGELOG.md`.

---

## Version Synchronisation

| File                       | Field         | Managed by                                                        |
| -------------------------- | ------------- | ----------------------------------------------------------------- |
| `package.json`             | `version`     | release-please                                                    |
| `android/app/build.gradle` | `versionName` | release-please (via regex transform)                              |
| `android/app/build.gradle` | `versionCode` | `scripts/bump-version-code.js` (increments on each release build) |
