# CALL CENTER

Static member site. No build step, no install, no internet required
(fonts fall back gracefully when offline).

## Start

**`installer.bat`** - one double-click does everything (self-elevates to
admin):
   - downloads the web server (Caddy → `server/`)
   - opens TCP 80 + 443 in the Windows firewall, allows `caddy.exe`, and
     **disables any inbound BLOCK rule** that targets 80/443 (these
     silently override allow rules on some hardened server images)
   - creates `server.conf`
   - **diagnoses the network**: compares the machine's local IPv4 with
     its public IP. If they differ the box is behind provider NAT and
     you must forward 80/443 in the host panel - it says so explicitly.
   - registers autostart on boot
   - starts hosting immediately at the end

**`start.bat`** - restart hosting later, or run it standalone. Close the
window to take the site offline. (`installer.bat` calls it for you.)

> **Bulletproof / DDoS-protected hosts:** the edge firewall in front of
> the server filters ports by default. No script can change that layer -
> open (or port-forward) TCP **80** and **443** inbound in the host's
> control panel. Everything on the server itself is handled by the two
> batch files.

Without a domain it serves on `http://localhost` and on the machine's
LAN address, so it works fine on a normal PC too. Both URLs are printed
when it starts.

### Publishing under a domain

Point the domain's A record at the server's IP, then in `server.conf`:

```
DOMAIN=yourdomain.com
```

Restart `start.bat`. Caddy fetches a free HTTPS certificate on the first
request and renews it by itself - nothing else to configure.

`Caddyfile` is generated on every start; edit `server.conf`, not that file.
`.bat`, `.md`, `.conf`, `Caddyfile` and `server/` are blocked with 404,
so the server never hands out its own configuration.

## Change the crew

Everything lives in **`js/members.js`**:

```js
{ alias: 'KLINIKUM', rank: 'OWNER', status: 'ACTIVE', owner: true, img: 'img/klinikum.jpg' },
```

| field    | meaning |
|----------|---------|
| `alias`  | the name on the card |
| `rank`   | free text: `OWNER`, `CO-OWNER`, `MANAGEMENT`, `OPERATIVE`, ... |
| `status` | `ACTIVE` (red pulsing dot) / `SILENT` (grey) / `VEILED` (amber) |
| `owner`  | `true` -> red OWNER badge |
| `img`    | picture, e.g. `img/name.png`. Leave it out and **a sigil is generated from the alias** instead. If the file is missing, the sigil takes over automatically. |

Add or remove lines freely - the grid, the file numbers (`#001`, `#002`, ...)
and the overlay all follow automatically.

## The background film

`video/background.mp4` runs behind the entire site on a loop. It starts
muted, and its sound fades in to **50 %** when you click `[ ENTER ]`.
The button in the bottom right corner toggles it.

Swap the film by replacing that file (H.264 + AAC mp4). To change how
present it is, edit `.bg__video` in `css/style.css`:

```css
.bg__video{ opacity:.82; filter:grayscale(.1) contrast(1.02) brightness(.9) saturate(.95) }
```

The volume lives in `js/main.js`:

```js
var TARGET_VOL = 0.5;   // 0.0 – 1.0
```

## Files

```
installer.bat         one-time server setup
start.bat             hosts the site
server.conf           domain / port
index.html            markup
css/style.css         the whole look
js/members.js         ← the only file you normally edit
js/sigil.js           deterministic SVG seal generator
js/main.js            gate, grid, overlay, cursor, film sound
video/background.mp4  the looping background film
server/caddy.exe      the web server (downloaded by installer.bat)
```
