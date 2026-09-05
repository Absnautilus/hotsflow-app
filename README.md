# Hotsflow App

Unified staff-facing application shell for the Hotsflow hotel operations suite.

## Scope

This repository owns the platform frontend shell only:

- authentication/session entry
- property context
- global navigation
- module availability states
- platform pages such as Home, Team and Settings
- shared shell states and layout

Module business logic remains in the module repositories.

## Modules

- Housekeeping
- Turni
- Transfer

## Architecture

- React + TypeScript + Vite
- React Router
- Supabase client configured via environment variables
- Core integration added progressively through the Hotsflow Core SDK

This repository must not duplicate Core authorization rules or module business logic.
