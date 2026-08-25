BACKGROUND FILM
===============

    background.mp4

is the film that runs behind the whole site. It starts muted and
silent, and its sound fades in to 50% the moment you click [ ENTER ].
The button in the bottom right corner turns the sound on and off.

To swap the film: drop in another mp4 (H.264 + AAC) and name it
background.mp4. Nothing else needs to change.

How dark / how visible the film is, is set in css/style.css:

    .bg__video { opacity: .46; filter: ... brightness(.62) ... }

Higher opacity = film more present. Lower = more atmosphere, less noise.
