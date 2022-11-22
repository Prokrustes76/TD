class Unit {
  constructor(i, x, y) {
    this.type        = i
    this.name        = ['Handgun', 'Factory'][i]
    this.asleep      = -1
    this.nextShot    = -1
    this.speed       = [125, 110][i]
    this.range       = [115,  70][i]
    this.angle       = 0
    this.amount      = 0
    this.extra       = false
    this.cost        = Unit.cost[i]
    this.value       = this.cost
    this.hits        = 0
    this.misses      = 0
    this.exp         = 0
    this.level       = 1
    this.imgNummer   = [1,2][i]
    this.bullets     = []
    this.nails       = []
    this.target      = game.enemies[0]
    this.method      = Unit.targetMethods[0]
    this.shootSound  = [1][i]
    this.pos         = {x: x, y: y, w: Unit.size[i], h: Unit.size[i]}
  }

  static targetMethods = ['first', 'last', 'strongest', 'fastest']
  static cost    = [60, 150]
  static size    = [40, 60]

  static selected(i) {
    if (game.gold >= Unit.cost[i])
      game.placeUnit = i
    else error('Not enough gold!')
  }

  static check(i = game.placeUnit) {
    let works = true

    if (mouse.x < 70 || mouse.x > 625 || mouse.y < 70 || mouse.y > 480)
      works = false
    for (let u of game.units)
      if (Math.hypot(u.pos.x - mouse.x, u.pos.y - mouse.y) < u.pos.w / 2.2 + Unit.size[i] / 2.2)
        works = false
      if (Unit.streetTooNear(i)) 
        works = false
    
    if (!works) error('Not enough space!')

    return works
  }

  static streetTooNear(z) {
    for (let i = 1; i < game.route.length; i++) {
      let offSetX = game.route[i].x - game.route[i - 1].x
      let offSetY = game.route[i].y - game.route[i - 1].y
      let dist = Math.hypot(offSetX, offSetY)
      for (let j = 0; j < dist; j += 3) {
        let x = game.route[i - 1].x + offSetX * (j / dist)
	  let y = game.route[i - 1].y + offSetY * (j / dist)

        if (z)  if (Math.hypot(z.x -x, z.y - y) < 15)
          return true
        if (!z) 
          if (Math.hypot(x - mouse.x, y - mouse.y) < Unit.size[0] * .9) 
            return true  
      }
    }
    return false 
  }

  static buy(i = game.placeUnit) {
    game.gold -= Unit.cost[i]
    game.units.push(new Unit(i, mouse.x, mouse.y))
    game.placeUnit = undefined
  }

  clicked() {
    game.selectedUnit = game.selectedUnit == this ? undefined : this
    game.checkButtons()
  }

  findTarget() {
    let arr = game.enemies.filter(e => calcDist(e, this) < this.range)

    if (this.method == 'first')
       return arr.sort((a, b) => a.travelled - b.travelled)[arr.length - 1]
    if (this.method == 'last')
       return arr.sort((a, b) => a.travelled - b.travelled)[0]
    if (this.method == 'strongest')
       return arr.sort((a, b) => a.value - b.value)[0]
    if (this.method == 'fastest')
       return arr.sort((a, b) => a.speed - b.speed)[0]
  }

  action() {
    for (let b of this.bullets) 
      b.move()
    for (let n of this.nails)
      n.check()
     if (this.nextShot > game.time || (this.type == 0 && !this.target))
      return
    if (this.type == 0) this.shoot()
    if (this.type == 1) this.makeNails()

    this.nextShot = game.time + this.speed
  }

  shoot() { 
    this.bullets.push(new Bullet(this))
    audios[this.shootSound].currentTime = 0
    audios[this.shootSound].play()
  }

  makeNails() {
    this.nails.push(new Nail(this))
  }

  miss() {
    this.misses++
  }

  show(x = this.pos.x, y = this.pos.y, size = this.pos.w) {
    this.target = this.findTarget()
    if (this.target) 
      this.angle = Math.atan2(this.target.pos.y - this.pos.y, this.target.pos.x - this.pos.x)

    if (this == game.selectedUnit) 
      circle(this.pos.x, this.pos.y, this.range, 'rgba(0, 0, 0, .25)')

    ctx.save()
    ctx.translate(x, y)
    if (this.type == 0) 
      ctx.rotate(this.angle)
    ctx.drawImage(images[this.imgNummer], -size / 2 , -size / 2, size , size )
    ctx.restore()
   
    for (let b of this.bullets) 
      b.show()
    for (let n of this.nails)
      n.show()
  }

  deleteMe() {
    game.gold += this.value * 0.8
    game.units.splice(game.units.indexOf(this), 1)
  }
  
}

class Bullet {
  constructor(unit) {
    this.unit         = unit
    this.pos          = {x: unit.pos.x, y: unit.pos.y}
    this.size         = [2][unit.type]
    this.speed        = [5][unit.type]
    this.range        = [130][unit.type]
    this.power        = [1] [unit.type]
    this.col          = ['black'][unit.type]
    this.dir          = unit.angle
  }

  move() {
    this.pos.x += Math.cos(this.dir) * this.speed
    this.pos.y += Math.sin(this.dir) * this.speed
    for (let e of game.enemies)
      if (calcDist(e, this) <= e.size)
        this.hit(e)
    if (calcDist(this.unit, this) > this.range) {
      this.deleteMe()
      this.unit.miss()
      }
  }

  hit(target) {
    this.unit.hits++
    target.beingHit(this.power)
    this.deleteMe()
  }

  deleteMe() {
    this.unit.bullets.splice(this.unit.bullets.indexOf(this), 1)
  }

  show() {
    circle(this.pos.x, this.pos.y, this.size, this.col)
  }
}

class Nail {
  constructor(unit) {
    this.unit  = unit
    this.power = 1
    this.pos   = this.getPos() || {x: -100, y: -100}
    this.angle = Math.random() * 2 * Math.PI
  }

  getPos() {
    for (let i = 0; i < 100; i++) {
      let dist  = Math.random() * 30 + 40
      let angle = Math.random() * 2 * Math.PI
      let x =  this.unit.pos.x + Math.cos(angle) * dist
      let y =  this.unit.pos.y + Math.sin(angle) * dist
      let z = {x: x, y: y}
      if (Unit.streetTooNear(z)) 
        return z
    }
  }

   check() {
     for (let e of game.enemies)
       if (calcDist(this, e) < e.size + 5)
         this.hit(e)
   }

  hit(target) {
    this.unit.hits++
    target.beingHit(this.power)
    this.deleteMe()
  }

  deleteMe() {
    this.unit.nails.splice(this.unit.nails.indexOf(this), 1)
  }

   show() {
     ctx.save()
     ctx.translate(this.pos.x, this.pos.y)
     ctx.rotate(this.angle)
     rect( 0, -5, 1, 10, 'black', false)
     rect(-2, -5, 4,  1, 'black', false)
     ctx.restore()
   }
}

