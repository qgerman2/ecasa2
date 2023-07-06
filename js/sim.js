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
	control_offset = param.g / (2*Math.cos(param.alpha)/param.m)
}

function control(s) {
	return {
		T1 : -9.00668242359435*s.theta - 0.0102160401165573*s.x + 1.6627661565654*s.y - 17.317051994822*s.dtheta - 0.179734374117869*s.dx + 11.0851172572598*s.dy + control_offset,
		T2 : 10.2537624674079*s.theta + 0.0137690087985938*s.x + 1.66277212643942*s.y + 18.3494747507769*s.dtheta + 0.222300703138698*s.dx + 11.08513321895*s.dy + control_offset

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