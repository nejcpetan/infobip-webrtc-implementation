# Dokumentacija Klicne Aplikacije z Infobip API

## Pregled
Ta aplikacija je preprosta spletna klicna aplikacija, ki uporablja Infobip API za vzpostavljanje klicev. Aplikacija je zgrajena z Next.js ogrodjem in uporablja shadcn/ui komponente za uporabniški vmesnik.

## Tehnične zahteve
- Node.js
- Next.js 14+
- Infobip API ključ
- shadcn/ui komponente
- Tailwind CSS

## Struktura projekta 

├── app/
│ ├── api/
│ │ └── call/
│ │ └── route.ts # API endpoint za klice
│ └── page.tsx # Glavna stran aplikacije
├── components/
│ └── DialPad.tsx # Komponenta številčnice
└── .env.local # Okoljske spremenljivke
bash
npm install lucide-react
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
INFOBIP_API_KEY=vaš_infobip_api_ključ

## Komponente

### 1. DialPad (components/DialPad.tsx)
Številčnica omogoča:
- Vnos telefonske številke preko gumbov
- Ročni vnos številke
- Brisanje vnesene številke
- Sprožitev klica

### 2. API Route (app/api/call/route.ts)
Skrbi za komunikacijo z Infobip API-jem:
- Sprejema POST zahteve
- Posreduje zahteve na Infobip API
- Upravlja z avtentikacijo
- Vrača odgovore klientu

## Nastavitev projekta

### 1. Namestitev potrebnih paketov

```bash
npm install lucide-react
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
```
### 2. Konfiguracija okolja
Ustvarite `.env.local` datoteko z naslednjimi podatki:
```bash
INFOBIP_API_KEY=vaš_infobip_api_ključ
```
### 3. Infobip konfiguracija
Za delovanje potrebujete:
- Veljaven Infobip API ključ
- Konfigurirano aplikacijo v Infobip nadzorni plošči
- Nastavljeno klicno konfiguracijo
- Registrirano telefonsko številko za odhodne klice

## Kako deluje

1. **Uporabniški vnos**
   - Uporabnik lahko vnese številko preko številčnice ali tipkovnice
   - Številka se prikaže v vnosnem polju

2. **Procesiranje klica**
   - Ob kliku na gumb "Call" se sproži `handleCall` funkcija
   - Podatki se pošljejo na lokalni API endpoint `/api/call`

3. **API komunikacija**
   - Lokalni API endpoint sestavi zahtevo za Infobip
   - Doda potrebne glave (headers) in avtentikacijo
   - Pošlje zahtevo na Infobip API
   - Vrne odgovor uporabniškemu vmesniku

4. **Obdelava odgovora**
   - Uporabniški vmesnik prikaže uspeh ali napako
   - V primeru uspeha se prikaže obvestilo o uspešno vzpostavljenem klicu
   - V primeru napake se prikaže obvestilo o napaki

## Potrebne nastavitve za razvijalce

1. **Infobip račun**
   - Registrirajte se na Infobip platformi
   - Pridobite API ključ
   - Ustvarite aplikacijo v Infobip nadzorni plošči
   - Nastavite klicno konfiguracijo

2. **Okolje**
   - Klonirajte repozitorij
   - Namestite odvisnosti z `npm install`
   - Ustvarite `.env.local` z API ključem
   - Zaženite razvojni strežnik z `npm run dev`

3. **Testiranje**
   - Preverite, da je API ključ pravilen
   - Testirajte z veljavno telefonsko številko
   - Preverite odzive v konzoli brskalnika
   - Spremljajte dnevnike v Infobip nadzorni plošči

## Varnostna opozorila
- API ključ nikoli ne sme biti javno dostopen
- Vedno uporabljajte okolijske spremenljivke za občutljive podatke
- Implementirajte ustrezno validacijo telefonskih številk
- Dodajte omejitve za število klicev

## Tehnične podrobnosti
- Aplikacija uporablja Next.js API routes za varno komunikacijo
- Implementiran je "use client" direktiva za interaktivne komponente
- Uporablja se Fetch API za HTTP zahteve
- Uporablja WebRTC za avdio komunikacijo
- Implementirano upravljanje z mikrofonom naprave
- Tailwind CSS skrbi za stiliranje
- shadcn/ui komponente zagotavljajo konsistenten izgled

## Nadaljnji razvoj
Možne izboljšave:
- Dodajanje zgodovine klicev
- Implementacija avtentikacije uporabnikov
- Dodajanje podpore za SMS sporočila
- Izboljšana obravnava napak
- Dodajanje zvočnih efektov za številčnico