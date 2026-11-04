# Organizing writeups

Events appear as clickable folders on the homepage and at `/events/`.
Each event page lists its assigned writeups. Tags link to writeups across events.

Each event card uses an anime cover and a blossom sticker by default. To give
an event its own artwork and emoji, create `content/events/ectf-2026/_index.md`:

```toml
+++
title = 'eCTF 2026'
cover = '/images/covers/bg6.webp'
emoji = '🦊'
+++
```

The event directory must match its URL slug (`eCTF 2026` → `ectf-2026`).

Add these fields inside a writeup's existing TOML front matter:

```toml
events = ['eCTF 2026']
tags = ['rev', 'custom-tag']
difficulty = 'easy'
```

For example, `content/post/ectf_2026/challenge-one.md` can contain:

```markdown
+++
title = 'Challenge One'
date = '2026-11-04T12:00:00+06:30'
draft = false
events = ['eCTF 2026']
tags = ['rev']
difficulty = 'easy'
+++

## Analysis

Your writeup here.
```

The `events` field controls the displayed grouping; the disk folder alone does
not assign an event. Keep the same event spelling across writeups. You can keep
existing file paths and URLs when adding events or tags.

New posts created with `hugo new content post/ectf_2026/challenge-one.md` include
empty `events` and `tags` fields for you to fill in.

Set `difficulty = 'easy'`, `'medium'`, or `'hard'` to show a difficulty badge
immediately before the tags: `easy rev`, `medium rev`, or `hard rev`.
Easy is sage, medium is warm amber, and hard is burgundy. Leave difficulty empty or omit
it to hide the badge. This works on post cards and article panels.

Edit `data/tag_colors.yml` to set your own tag colors:

```yaml
rev: '#b91c1c'
pwn: '#1d4ed8'
web: '#c2410c'
custom-tag: '#047857'
```

Use lowercase tag names in the color file and six-digit hex colors. The color is
blended into a muted charcoal gradient with light text. Tags without a configured color
use slate. Badges appear at the top-right of post cards and article panels.

These templates apply to this repository's Reimu site. The separate
`offsec-n0t3` site built by GitHub Actions has its own theme and templates.
