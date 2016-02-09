
#Crossfire
> The prototype project for the game Star Catcher: Space Saga (WT) 

###Bugs
  - When multiple collisions occur with the box body (player) one or more of the colliding sphere bodies will have a broken body and the resulting DOMElement and node are not cleared away but remain on the screen unmoving
  - Using Position class on sphere to animate a timed movement breaks collision detection (collision detections expects Position values to be in VEC3 Obj not POSITION Obj)

---

###Installation

```bash
git clone git@github.com:skaraman/Crossfire.git
cd Crossfire
```

---

###Development
Run the dev server with ```npm run dev```

Now the dev server should be running on localhost:1618

Run the linters with ```npm run lint```

Run All Tests with ```npm test```

---

###Need help?


There are api docs at -->
http://famous.org/docs

---

###LICENSE

MIT
=======
# Crossfire
A game 
>>>>>>> 455415ba5b51af5599d3bcd8c31ff868772927a3
