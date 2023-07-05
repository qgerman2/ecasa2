import sys
from sympy.core import Derivative, Eq, Symbol, Function, diff
from sympy.core.function import UndefinedFunction
from sympy.solvers import solve
from sympy.printing.jscode import JavascriptCodePrinter

class EOM():
	param = []
	input = []
	# Clear equations and set degrees of freedom
	def __init__(self, t: Symbol, *args: Function):
		self.printer = self.Printer(self)
		self.t = t
		self.dof = []
		self.eqs = []
		for arg in args:
			self.dof.append(arg)
		for i in range(len(self.dof)):
			self.eqs.append(diff(self.dof[i], self.t))
		if len(self.dof) > 0: self.max_order = 1
	# Add equations to the system
	def add_eq(self, *eqs: Eq):
		for eq in eqs:
			for der in eq.lhs.atoms(Derivative):
				if der.expr in self.dof:
					n = self.dof.index(der.expr)
					t = len(self.dof)
					order = der.args[1][1]
					# Add empty equations if the order of derivatives is higher
					if order > self.max_order:
						for o in range(order - self.max_order):
							for i in range(len(self.dof)):
								self.eqs.append(diff(self.dof[i], self.t, o + self.max_order + 1))
						self.max_order = order
					self.eqs[n + (order - 1) * t] = solve(eq, der, simplify=False)[0]
	# State vector
	def state(self):
		coeffs = []
		for i in range(self.max_order):
			for dof in self.dof:
				coeffs += [diff(dof, self.t, i)]
		return coeffs
	# Print
	def printjs(self, file = False):
		if file:
			original_stdout = sys.stdout
			file = open(file, "w")
			sys.stdout = file
		print("function eom(s, p, i", end="")
		print(") {\n\treturn [")
		first = True
		for eq in self.eqs:
			if first:
				first = False
			else:
				print(",")
			print("\t\t" + self.printer.doprint(eq.simplify()), end="")
		print("\n\t]\n}")
		if file:
			sys.stdout = original_stdout
			file.close()

	class Printer(JavascriptCodePrinter):
		def __init__(self, eom):
			self.eom = eom
			super().__init__()
		def _prefix(self, x):
			if x in self.eom.dof:
				return "s."
			elif x in self.eom.param:
				return "p."
			elif x in self.eom.input:
				return "i."
			else:
				return ""
		def _print_Symbol(self, x: Symbol):
			return self._prefix(x) + x.name
		def _print_Derivative(self, expr):
			function, *vars = expr.args
			if isinstance(type(function), UndefinedFunction):
				return self._prefix(function) + "d" * vars[0][1] + function.name
			else:
				return super()._print_Derivative(expr)
		def _print_Function(self, expr):
			if isinstance(type(expr), UndefinedFunction):
				return self._prefix(expr) + expr.name
			else:
				return super()._print_Function(expr)