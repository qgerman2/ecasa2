var state = {
	x : 0,
	y : 0,
	theta : 0,
	dx : 0,
	dy : 0,
	dtheta : 0
}
var param = {
	g : 9.81,
	m : 24,
	alpha : Math.PI/6,
	w : 0.20,
	h : 0.30
}	
var input = {
	T1 : 0,
	T2 : 0
}
var camera2d = {
	x : 1280/2,
	y : 720/2,
	scale : 75
}

auto = true

function setup() {
	createCanvas(1280, 720)
	timestep = 1/60
	control_offset = 135.931347
}

function control(s) {
	return {
		T1 : -8.99508687596126*s.theta - 0.0101699793138771*s.x + 1.66276590023259*s.y - 17.3871490145351*s.dtheta - 0.179184595947719*s.dx + 11.0851165329715*s.dy + control_offset,
		T2 : 10.2765553326191*s.theta + 0.0138150694274782*s.x + 1.66277209557984*s.y + 18.4670683818401*s.dtheta + 0.222850477529636*s.dx + 11.0851332514327*s.dy + control_offset
	}
}

function keyPressed() {
	if (keyCode == 67) {
		auto = !auto
	}
}

function mouseClicked() {
	Object.keys(state).forEach(key => {state[key] = 0})
	state.x = (mouseX - camera2d.x) / camera2d.scale 
	state.y = (mouseY - camera2d.y) / camera2d.scale
}

function update() {
	//Reset on R
	if (keyIsDown(82)) { 
		Object.keys(state).forEach(key => {state[key] = 0})
	}
	//Inputs
	if (auto) {	
		input = control(state)
	} else {
		Object.keys(input).forEach(key => {input[key] = 0})
		if (keyIsDown(LEFT_ARROW)) {input.T2 = 200}
		if (keyIsDown(RIGHT_ARROW)) {input.T1 = 200}
	}
	// Avanzar simulación
	x = Object.values(state)
	dx = eom(state, param, input)
	x = math.add(x, math.multiply(timestep, dx))
	Object.keys(state).forEach((key, i) => state[key] = x[i])
}

function draw() {
	update()
	background(220);
	// Dibujar información
	Object.keys(state).forEach((key, i) => {
		text(key + ": " + state[key].toFixed(5), 10, 20 + 15 * i)
	})
	Object.keys(input).forEach((key, i) => {
		text(key + ": " + input[key], 10, 120 + 15 * i)
	})
	Object.keys(param).forEach((key, i) => {
		text(key + ": " + param[key], 100, 20 + 15 * i)
	})
	text("auto: " + auto, 10, 200)
	text("Use left and right arrow keys for thrusters\nPress R to reset to 0,0\nPress C to toggle auto pilot\nClick on screen to teleport the ship", 300, 15)
	// Establecer camara
	translate(camera2d.x, camera2d.y)
	scale(camera2d.scale)
	// Dibujar satélite
	push()
	strokeWeight(0.01)
	translate(state.x, state.y)
	rotate(state.theta)
	rect(-param.w/2, -param.h/2, param.w, param.h)
	arrow([param.w/2, param.h/2], math.multiply([Math.sin(param.alpha), Math.cos(param.alpha)], input.T1/150))
	arrow([-param.w/2, param.h/2], math.multiply([-Math.sin(param.alpha), Math.cos(param.alpha)], input.T2/150))
	pop()
}

function arrow(origin, vector, color=[0, 0, 0]) {
	push()
	stroke(...color)
	line(...origin, ...math.add(vector, origin))
	pop()
}