function eom(s, p, i) {
	return [
		s.dx,
		s.dy,
		s.dtheta,
		(i.T1*Math.sin(p.alpha) - i.T2*Math.sin(p.alpha) + p.g*p.m*s.theta)/p.m,
		(-i.T1 - i.T2)*Math.cos(p.alpha)/p.m,
		6.0*(-i.T1*p.h*Math.sin(p.alpha) + i.T1*p.w*Math.cos(p.alpha) + i.T2*p.h*Math.sin(p.alpha) - i.T2*p.w*Math.cos(p.alpha))/(p.m*(Math.pow(p.h, 2) + Math.pow(p.w, 2)))
	]
}
