# Banebookingssystem prototype (hackathon)

Denne mappe indeholder en Next.js prototype-struktur, klar til hurtig udvikling.

## Stack

- Next.js (App Router)
- Tailwind CSS
- DaisyUI
- TypeScript

## Start

```bash
npm install
npm run dev
```

## Vigtig struktur

- `app/login` – login/roller (admin, træner, spiller, spectator)
- `app/dashboard` – samlet oversigt
- `app/events` – kampe/træninger
- `app/bookings` – booking-oprettelse
- `app/requests` – admin approve/deny
- `app/scoreboard` – institut/hold-scoreboard
- `app/training-schedule` – faste træningsdage

Formålet er at have en robust infrastruktur, så features kan implementeres hurtigt under hackathon.
