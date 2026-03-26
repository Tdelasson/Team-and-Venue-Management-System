# Banebookingssystem prototype

Next.js prototype af et bane-bookingssystem bygget med Tailwind CSS og DaisyUI.

## Funktioner i prototypen

- Login efter institut/uddannelse/klub samt rolle (admin, træner, spiller, spectator)
- Oversigt over events (kampe/træninger)
- Trænere kan oprette booking-requests til bane
- Admin kan godkende/afvise requests for kampe, træninger og faste træningsdage
- Visning af dobbelt trænings-booking i samme tidsrum
- Faste træningsrequests (1-2 gange ugentligt)
- Scoreboard pr. institut/klub
- Spillere kan deltage/aflyse til godkendte events
- Spectators kan deltage på kampe og skal være tilknyttet et hold

## Kom i gang

```bash
npm install
npm run dev
```

Appen kører derefter på `http://localhost:3000`.

## Kvalitetscheck

```bash
npm run lint
npm run build
```
