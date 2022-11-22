class Button {
  constructor(i) {
    this.id       = i
    this.text     = this.getText(i)
    this.textSize = [0,1,2,3,4,5,14].includes(i) ? 24 : 12
    this.textCol  = 'black'
    this.backCol  = this.getColor(i) 
    this.pos      = [{x: 675, y: 50,  w: 100, h: 50},
                     {x: 675, y: 120, w: 100, h: 50},
			   {x: 675, y: 250, w: 100, h: 50},
			   {x: 675, y: 60,  w: 100, h: 50},
                     {x: 685, y: 180, w:  80, h: 80},
			   {x: 685, y: 280, w:  80, h: 80},
                     {x: 675, y: 10,  w:  25, h: 30},
			   {x: 700, y: 10,  w:  25, h: 30},
                     {x: 725, y: 10,  w:  25, h: 30},
                     {x: 750, y: 10,  w:  25, h: 30},
			   {x: 225, y: 532, w:  65, h: 22},
			   {x: 225, y: 559, w:  65, h: 22},
			   {x: 295, y: 532, w:  65, h: 22},
			   {x: 295, y: 559, w:  65, h: 22},
                     {x: 570, y: 535, w:  80, h: 40}][i]
  }

  getText(i) {
    return i < 4 ?           ['Undo', 'Clear', 'Done', 'Start'][i] :
           i > 9 && i < 14 ? Unit.targetMethods[i - 10] :
           i == 14         ? 'SELL' : undefined  
  }

  getColor(i) {
    return ['orange', 'orange', 'green', 'green', '#222', 
            '#222', '#444', '#777', '#444', '#777', 
            '#444', '#444', '#444', '#444', 'red'][i]
  }

  show() {
    rect(this.pos.x, this.pos.y, this.pos.w, this.pos.h, this.backCol)
    if (game.selectedUnit && Unit.targetMethods.indexOf(game.selectedUnit.method) == this.id - 10)
      rect(this.pos.x, this.pos.y, this.pos.w, this.pos.h, 'rgba(255, 255, 255, .15)')

    if ([4,5].includes(this.id)) {
      ctx.drawImage(images[this.id == 4 ? 1 : 2], this.pos.x, this.pos.y, 80, 80)
      return
    }

    if (game.timeFactor == this.id - 5)
      this.showArrow()

    this.showText()
  }

  showText() {
       
    if (this.id > 5 && this.id < 10) {
      write('x', this.pos.x + this.pos.w / 2 - 4, this.pos.y + 10, 14, 'black')
      write(this.id - 5, this.pos.x + this.pos.w / 2 + 4, this.pos.y + 11, 14, 'black')
    }

    if (this.text)
      write(this.text,
            this.pos.x + this.pos.w / 2, 
            this.pos.y + this.pos.h / 2 + 1,
            this.textSize,
            this.textCol)
  }

  clicked() { 
    if (this.id == 0) 		game.route.pop()
    else if (this.id == 1)	game.route = []
    else if (this.id == 2) {
      if (game.distance > 1000) {
        game.phase = 1; 
        game.phaseChange()
      }
      else error('Route is too short!')
    }
    else if (this.id == 3)   {game.roundStart = true
                              this.deleteMe()}
    else if (this.id == 4)    Unit.selected(0)
    else if (this.id == 5)    Unit.selected(1)
    else if (this.id > 5 && this.id < 10)    
      				game.timeFactor = this.id  - 5
    else if (this.id > 9 && this.id < 14)  
      game.selectedUnit.method = Unit.targetMethods[this.id - 10]
    else if (this.id == 14)
      game.selectedUnit.deleteMe()
  }

  deleteMe() {
    game.buttons.splice(game.buttons.indexOf(this), 1)
  }

  showArrow() {
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.moveTo(this.pos.x +  4, this.pos.y + this.pos.h)
    ctx.lineTo(this.pos.x + 20, this.pos.y + this.pos.h)
    ctx.lineTo(this.pos.x + 12, this.pos.y + 20)
    ctx.lineTo(this.pos.x +  4, this.pos.y + this.pos.h)
    ctx.fill()
  }

}