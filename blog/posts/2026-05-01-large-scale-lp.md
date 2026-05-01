Large-scale linear programming (LP) is a fundamental tool in operations research, with applications ranging from supply chain management to machine learning. This post surveys key algorithmic approaches for solving LP problems with millions of variables and constraints.

## Interior-Point Methods

Interior-point methods (IPMs) are the workhorse of modern LP solvers. Unlike the simplex method which traverses vertices of the feasible polytope, IPMs follow a **central path** through the interior. The primal-dual path-following algorithm achieves polynomial-time complexity and scales well to large problems.

Key advantages of IPMs:
- Polynomial-time convergence guarantees
- Robust performance across problem types
- Efficient sparse linear algebra kernels
- Natural extension to convex conic optimization

## Decomposition Techniques

For problems with special structure, decomposition methods can dramatically reduce computational cost:

- **Benders decomposition** — separates integer and continuous variables, solving iteratively
- **Dantzig-Wolfe decomposition** — exploits block-angular structure via column generation
- **Lagrangian relaxation** — dualizes complicating constraints

These methods are particularly effective for stochastic programming and network flow problems.

## First-Order Methods

For extremely large instances where even IPMs are too expensive, first-order methods offer attractive alternatives:

| Method | Per-Iteration Cost | Convergence Rate |
|--------|-------------------|-------------------|
| ADMM | Low | Linear |
| PDHG | Low | Linear |
| Subgradient | Very Low | Sublinear |

Modern implementations leverage GPU acceleration for matrix-vector products.

## Code Example

Here is a minimal Julia implementation using JuMP:

```julia
using JuMP, Gurobi

model = Model(Gurobi.Optimizer)
@variable(model, x[1:n] >= 0)
@objective(model, Min, c' * x)
@constraint(model, A * x .== b)
optimize!(model)
```

## References

- Nesterov & Nemirovskii, *Interior-Point Polynomial Algorithms in Convex Programming*, 1994
- Wright, *Primal-Dual Interior-Point Methods*, 1997
- Boyd et al., "Distributed Optimization and Statistical Learning via ADMM", 2011
