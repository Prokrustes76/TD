class Game {
  constructor() {
    this.running    = true
    this.paused     = false
    this.timeTotal  = 0
    this.time       = 0
    this.timeFactor = 1
    this.phase      = 0
    this.round      = 0
    this.route      = []
    this.distance   = 0
    this.buttons    = []
    this.coming     = []
    this.enemies    = []
    this.units      = []
    this.allButtons = []
    this.lives      = 100
    this.gold       = 100
    this.roundStart = true
    this.placeUnit    = undefined
    this.selectedUnit = undefined
    this.errorText    = {text: '', time: -1000}

    for (let i = 0; i < 15; i++)
      this.allButtons.push(new Button(i))
  }

  init() {
    this.phaseChange()
  }

  doStuff() {
    if (++this.timeTotal % 2 == 0) return
    if (!this.paused && this.roundStart && this.running) 

    for (let i = 0; i < this.timeFactor; i++)
      this.logic()

      this.show()
  }

  newRound() {
    this.enemies = []
    this.coming  = Enemy.newEnemies(++this.round)
    this.roundStart = false
    for (let u of this.units) {
      u.nails    = []
      u.bullets  = []
      u.nextShot = game.time + 10
      u.target   = undefined
    }
  }

  phaseChange() {
    if (this.phase == 1) 
      this.newRound()
    this.checkButtons()
  }

  checkButtons() {
    this.buttons = []
    let start = -1, end = -2

    if (this.phase == 0) {
      start = 0; end = 2
    }
    if (this.phase == 1) {
      start = this.roundStart ? 4 : 3
      end = this.selectedUnit ? 14 : 9
    }
                           
    for (let i = start; i < end + 1; i++)
      this.buttons.push(this.allButtons[i])
  }

  logic() {
    this.time ++
    if (this.phase == 0) {
      this.buildRoute()
      return
    }
    
    this.checkNewEnemies()

    if (this.coming.length + this.enemies.length == 0)
      this.roundFinished()

    for (let e of this.enemies)
      e.move()

    for (let u of this.units)
      u.action()
  }

  checkNewEnemies() {
    if (this.coming.length && this.coming[0].birth <= this.time)
      this.enemies.push(this.coming.shift())
  }

  roundFinished() {
    this.phaseChange()
  }

  show() {
    rect(0, 0, 800, 600, '#222')
    ctx.drawImage(images[0], 50, 50)

    this.showRoute()
    this.showMenu()

    if (this.phase == 1)
      this.showObjects()

    if (this.paused) 
      this.pause()

    if (!this.running)
      this.gameOver()

    if (this.placeUnit != undefined)
      this.showPlaceUnit()

    this.showUnitMenus()

    if (this.errorText.time > game.timeTotal)
      this.showError()
  }

  showPlaceUnit() {
    let unit = this.placeUnit
    ctx.drawImage(images[unit + 1], mouse.x - Unit.size[unit] / 2, 
    mouse.y - Unit.size[unit] / 2, Unit.size[unit], Unit.size[unit])
  }

  showRoute() {
    if (this.phase == 0) 
      write('Click to contruct the route!', 350, 550, 50, '#555')

    if (this.route.length < 2) return
    ctx.lineWidth = 32 
    ctx.strokeStyle = '#555'
    ctx.beginPath()
    ctx.moveTo(this.route[0].x, this.route[0].y)
    for (let i = 0; i < this.route.length; i++)
      ctx.lineTo(this.route[i].x, this.route[i].y)
    ctx.stroke() 
    ctx.lineWidth = 1
  }

  showObjects() {
    for (let e of this.enemies)
      e.show()
    for (let u of this.units)
      u.show()
  }

  showMenu() {
    for (let b of this.buttons)
      b.show()
    if (this.phase != 1)
      return
    this.showTopInfo()
    this.buyMenu()
  }

  showTopInfo() {
    let len = game.coming.length
    write(`Lives: ${this.lives}`,    50, 25, 22, 'lightgreen', 'left') 
    write(`Gold:  ${this.gold}` ,   193, 25, 22, 'gold', 'left')
    write(`Round: ${this.round}`,   336, 25, 22, '#ccc', 'left')
    write(`Next:`               ,   475, 25, 22, '#ccc', 'left')
    write(len > 5 ? '...' : ''  ,   625, 27, 22, '+ccc', 'left')
    for (let i = 0; i < Math.min(5, len); i++)
      game.coming[i].show(545 + i * 18, 24)
  }

  buyMenu() {
    write('Buy Units:', 725, 150, 25, '#ccc')
  }

  showUnitMenus(unit = game.selectedUnit) {
    if (!unit) return

    let col = '#aaa'
    write('Type:'    ,    50, 520, 18, col, 'left')
    write('Hits: '   ,    50, 545, 18, col, 'left')
    write('Misses:'  ,    50, 570, 18, col, 'left')
    write(unit.name  ,   185, 520, 18, col, 'right')
    write(unit.hits  ,   185, 545, 18, col, 'right')
    write(unit.misses,   185, 570, 18, col, 'right')

    write('Preference:', 293, 520, 18, col, 'center')
  }

  showError() {
    rect(0, 500, 700, 100, '#222')
    write(this.errorText.text,  350, 550, 50, 'red')
  }

  pause() {
    rect(110, 200, 490, 180, 'rgba(0, 0, 0, .6)')
    write('PAUSE', 350, 300, 140, 'orange', 'center') 
    return
  }

  gameOver() {
    rect(70, 200, 560, 180, 'rgba(0, 0, 0, .6)')
    write('GAME OVER', 350, 300, 90, 'red', 'center') 
    return
  }

  buildRoute() {
    if (!clicked || mouse.x < 80 || mouse.x > 620 || mouse.y < 80 || mouse.y > 470)
      return
    if (this.route[0] && Math.hypot(mouse.x - this.route[this.route.length - 1].x, 
                                    mouse.y - this.route[this.route.length - 1].y) < 20)
      return

    this.route.push({x: mouse.x, y: mouse.y})
    
   this.distance = 0
   for (let i = 1; i < this.route.length; i++)
     this.distance += Math.hypot(this.route[i].x - this.route[i - 1].x,
                                 this.route[i].y - this.route[i - 1].y)
   
  }
}