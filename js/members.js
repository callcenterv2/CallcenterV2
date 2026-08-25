/* ============================================================
   THE REGISTER
   ------------------------------------------------------------
   This is the only file you need to touch to change the crew.

   alias   : the name shown on the card       (any text)
   rank    : OWNER / CO-OWNER / MANAGEMENT / OPERATIVE / ...
   status  : ACTIVE / SILENT / VEILED         (controls the dot colour)
   owner   : true  -> red "OWNER" badge + inverted seal
   img     : path to a picture, e.g. 'img/name.png'
             leave it out and a sigil is generated from the alias instead.
             If the file is missing, the sigil takes over automatically.

   Add or remove entries freely, the grid adapts.
   ============================================================ */

var MEMBERS = [
  { alias: 'KLINIKUM',     rank: 'OWNER',      status: 'ACTIVE', owner: true, img: 'img/klinikum.jpg' },
  { alias: 'TELE',         rank: 'OWNER',      status: 'ACTIVE', owner: true, img: 'img/tele.png' },

  { alias: 'LIYAN',        rank: 'CO-OWNER',   status: 'ACTIVE', img: 'img/liyan.png' },
  { alias: 'THANOS DADDY', rank: 'CO-OWNER',   status: 'ACTIVE', img: 'img/thanos.png' },

  { alias: 'APOTHEKE',     rank: 'MANAGEMENT', status: 'ACTIVE', img: 'img/apotheke.png' },
  { alias: 'METE',         rank: 'MANAGEMENT', status: 'ACTIVE', img: 'img/mete.png' },
  { alias: 'SHINOBI',      rank: 'MANAGEMENT', status: 'ACTIVE', img: 'img/shinobi.png' },

  { alias: 'ONYX',         rank: 'SPIELER',    status: 'ACTIVE', img: 'img/onyx.png' },
  { alias: 'GOTTESAUGE',   rank: 'SPIELER',    status: 'ACTIVE', img: 'img/gottesauge.png' }
];
