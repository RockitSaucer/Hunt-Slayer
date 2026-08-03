# REG SLAYER — Hunt Slayer

Production app for [regslayer.com](https://regslayer.com).

**Current release:** **V5.0 Beta**

## Features

- Alabama deer season planner (date, weapon, locations, weather/water)
- Map tools: measure, draw, track, layers, radar, compass/wind
- **Account login** (username + password) via Supabase
- **Personal maps** with cloud sync (local-first)
- **Shared maps** with party codes, member pins, live location share
- Multiple private maps per account

## User map data

Custom shapes, tracking lines, pins, and tracks are stored **per user** in
browser `localStorage` and Supabase — **not** in this repository.  
App updates keep the same storage keys so hunters do not lose drawings
between deploys. A clean code push does not ship anyone else's test shapes.

## Test site

Feature testing continues on the separate **test-offline** Vercel project.
This repo is the production Hunt Slayer codebase.

## Local preview

Open `index.html` via a local static server (or double-click for limited testing).
Auth and map sync require network access to Supabase.
