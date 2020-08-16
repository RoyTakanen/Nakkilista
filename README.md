# Nakkilista
Pieni todo-ohjelmisto, joka on tehty käyttäen vue.js:ää ja node.js:ää. Yksi niistä harvoista todo-palveluista, jotka tarjoavat API:n.

## Asentaminen ja konfigurointi

### Asentaminen

```bash
git clone https://github.com/kaikkitietokoneista/Nakkilista.git
cd Nakkilista
npm install
```

### Konfigurointi

Kaikki konfigurointi löytyy hakemistosta data. Tässä hakemistossa on myös tietokanta (database.db), jonka kopioimalla voi varmuuskopioida käyttäjät ja tehtävät.

Tiedosto data/config.json tulisi näyttää jotakuinkin tältä:
```json
{
  "mode": "production",
  "secret": "keyboard cat",
  "port": 80,
  "trust_proxy": 1,
  "cookie_secure": true
}
```

Tästä secret tulisi vaihtaa johonkin erittäin vaikeaan ja epäarvattavaan, mikäli ohjelma ei ole vain kehityskäytössä. Mikäli moden vaihtaa development:n tietokanta on vain muistissa ja helmet-paketti poistetaan käytöstä. Tällöin osa asetuksista muuttuu hyödyttömiksi. 

### Käynnistäminen

```bash
npm start
```

## Tulossa

1. Captcha (API:lle ja WEB UI:lle)
2. Projektit
  I. Julkiset
  II. Sisäiset
3. Tuki LDAP:lle.
