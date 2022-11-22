class Enemy { 
  constructor(i, type) {
    this.id		 = i
    this.value     = type + 1
    this.pos       = {x: game.route[0].x, y: game.route[0]. y}
    this.between   = [110, 110, 110, 110, 110, 110, 110, 90, 20][game.round - 1]
    this.birth     = game.time + this.between * i + 30
    this.etappe    = 1
    this.travelled = 0
    this.nextAim   = game.route[this.etappe]
    this.define(type)
  }

  define(type) {
    this.type     = type
    this.size     = [10, 11, 12][type]
    this.col	= ['red', 'forestgreen', 'yellow'][type]
    this.speed    = [1, 1.5, 2][type]
  }

  static newEnemies(i) {
    let arr  = [], 
        list = []

    if (i == 1) for (let i = 0; i < 12; i++) list.push(0)
    if (i == 2) for (let i = 0; i < 20; i++) list.push(0)
    if (i == 3) list = [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]
    if (i == 3) list = [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1]
    if (i == 4) for (let i = 0; i < 30; i++) list.push(1)
    if (i == 5) list = [0,0,1,2,0,0,1,2,0,0,1,2,0,0,1,2,0,0,1,2,0,0,1,2]
    if (i == 6) list = [0,1,1,2,0,1,1,2,0,1,1,2,0,1,1,2,0,1,1,2,0,1,1,2,0,1,1,2]
    if (i == 7) for (let i = 0; i < 25; i++) list.push(2)
    if (i == 8) for (let i = 0; i < 15; i++) list.push(0, 1, 2)
    if (i == 9) for (let i = 0; i < 100; i++) list.push(0)

     
    for (let i = 0; i < list.length; i++)
      arr.push(new Enemy(i, list[i]))
   
    return arr
  }

  move(speed = this.speed) {
    let offSetX = this.nextAim.x - this.pos.x
    let offSetY = this.nextAim.y - this.pos.y
    let dist    = Math.hypot(offSetX, offSetY)

    if (dist < speed) {
      if (this.etappe == game.route.length - 1) 
        this.reachedEnd()
  
      else {
        this.pos.x = this.nextAim.x
        this.pos.y = this.nextAim.y
        this.nextAim = game.route[++this.etappe]
        this.move(speed - dist)
      }
    }

    if (dist != 0) {
      offSetX = offSetX / dist * speed 
      offSetY = offSetY / dist * speed
    
      this.pos.x += offSetX
      this.pos.y += offSetY
      this.travelled += speed
    }
  }

  reachedEnd() {
    game.lives = Math.max(0, game.lives -= (this.type + 1))
    this.deleteMe()
    if (game.lives < 1) game.running = false
  }

  show(x = this.pos.x, y = this.pos.y) {
    ctx.fillStyle = this.col
    ctx.beginPath()
    ctx.ellipse(x, y, .7 * this.size, this.size, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  beingHit(damage) {
    audios[2].currentTime = 0
    audios[2].play()
    if (this.type <= 0) {
      game.gold += this.value
      this.deleteMe()
    }
    else this.define(this.type - damage)
  }
  
  deleteMe() {
    game.enemies.splice(game.enemies.indexOf(this), 1)
  }

}